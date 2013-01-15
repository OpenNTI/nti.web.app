Ext.define('NextThought.util.Search',{
	singleton: true,

	ignoredWordsRe: /\b(a|an|and|are|as|at|be|but|by|for|if|in|into|is|it|no|not|of|on|or|the|to|was)\b/ig,

	splitWhitespaceRe: /\W+/,

	trimRe: /^["'\s]+|["'\s]+$/ig,
	trimPunctuationReStr: '[\?!()"\'`{}\\[\\]:;,\\.\\^%&#\\*@$&\\+-<>=_~\\s]', //This matches the regex the DS uses

	/**
	 *
	 * @param string
	 * @param partial Set true to match the entire word not just the substring.
	 * @return {RegExp}
	 */
	searchRe: function(string,partial,wholeWordOnly){
		var tokens, str, bound = partial?'[^\\s\\)\\(\\.]*':'';

		str = string.replace(this.trimRe,'').replace(this.ignoredWordsRe,'');
		tokens = Ext.Array.map(str.split(this.splitWhitespaceRe), RegExp.escape);

		if(wholeWordOnly){
			bound = '\\b';
		}

		tokens = Ext.Array.clean(tokens);
		if(tokens.length === 0){ tokens.push(string); } //Avoid searching for an empty string.

		return new RegExp([ '(',bound,'(', tokens.join('|'), ')',bound,')' ].join(''), 'ig');
	},

	contentRegexFromSearchTerm: function(term, isPhrase){
		//Do any regex escaping required
		term = term.replace(/[.*+?|()\[\]{}\\$\^]/g,'\\$&');

		//to make things like qoutes in the term match unicode apostrophe their
		//unicode counterparts in our content replace non alpha numeric characters
		//with a regex group that matches any other non alpha numeric character.
		//Note this potentially matches court's to court-s but that is such a rare
		//case this should be ok in practice.
		term = term.replace(/[^a-zA-Z0-9 ]/g, "[^a-zA-Z0-9 ]");

		if(isPhrase){
			term = term.replace(/\s([^\]]|$)/g, this.trimPunctuationReStr+'+$1');
		}

		return term;
	},

	contentRegexForSearchHit: function(hit, phraseSearch){
		function isContent(hit){
			return (/content/i).test(hit.get('Type'));
		}

		var fragments = hit.get('Fragments'),
			terms = [], combinedRegex, escapedParts;

		if(!isContent(hit) || !fragments || fragments.length === 0){
			return null;
		}

		Ext.each(fragments, function(fragment, index){
			var fragTerms = [];
			if(!fragment.matches || fragment.matches.length === 0 || !fragment.text){
				console.warn('No matches or text for fragment. Dropping', fragment);
			}
			else{
				//Sort the matches backwards so we can do string replaces without invalidating

				Ext.each(fragment.matches, function(match, idx){
					var term,
						//Attempt to detect bad data from the server
						next = idx + 1 < fragment.matches.length ? fragment.matches[idx + 1] : [0, 0];
					if(next[1] > match[1]){
						console.warn('Found a match that is a subset of a previous match.  Server breaking its promise?', fragment.matches);
						return true; //continue
					}

					term = fragment.text.slice(match[0], match[1]);
					if(term){
						fragTerms.push(term);
					}
					return true;
				});

				terms = Ext.Array.merge(terms, fragTerms);
			}
		});

		if(terms.length > 0){
			terms = Ext.Array.unique(terms);
			escapedParts = Ext.Array.map(terms, function(item){
				return this.contentRegexFromSearchTerm(item, phraseSearch);
			}, this);
			combinedRegex = new RegExp(escapedParts.join('|'), 'ig');
		}

		return combinedRegex;
	},

	/*
	 * Returns a regex suitable for matching content from a search hit fragment
	 * returned from the dataserver.  If captureMatches is true regex capture groups
	 * will surround the various components of the fragment marking matching and non
	 * matching parts that correspond to the matches provided with the fragment.  When
	 * captureMatches is true this function returns an object with two properties. 're'
	 * is the regular expression, matchingGroups is an array of ints marking which capture
	 * group of re corresponds to each for the fragments matches.  These values are indexed start
	 * at 1.  Example;  a fragment of "the brown fox" with a match corresponding to "brown" will
	 * return the following. {re: /(the )(brown)( fox)/, matchingGroups: [2]}
	 */
	contentRegexForFragment: function(fragment, phraseSearch, captureMatches){
		var sortedMatches, currentIdx = 0, terms = [], groups = [], currentCapture = 1, me = this;

		function regexify(text, phrase, noCapture){
			var re = me.contentRegexFromSearchTerm(text, phrase);
			if(noCapture){
				return re;
			}
			currentCapture++;
			return '('+re+')';
		}

		if( !fragment ){
			return null;
		}

		if(!captureMatches){
			return new RegExp(this.contentRegexFromSearchTerm(fragment.text, true), 'ig');
		}

		if(Ext.isEmpty(fragment.matches)){
			return null;
		}

		sortedMatches = fragment.matches.slice();
		sortedMatches.sort(function(a, b){return a[0] - b[0];});

		Ext.each(sortedMatches, function(match, idx){
			var term,
			//Attempt to detect bad data from the server
			next = idx + 1 < fragment.matches.length ? fragment.matches[idx + 1] : [Infinity, Infinity];
			if(next[0] < match[1]){
				console.warn('Found a match that is a subset of a previous match.  Server breaking its promise?', fragment.matches);
				return true; //continue
			}

			//slice from current index up to the match. this is a none
			//match part
			if(currentIdx < match[0]){
				terms.push(regexify(fragment.text.slice(currentIdx, match[0]), true));
			}
			groups.push(currentCapture);
			//Now snag the actual match
			terms.push(regexify(fragment.text.slice(match[0], match[1]), phraseSearch));

			//update current
			currentIdx = match[1];
			return true;
		}, this);

		//snag what is left
		if(currentIdx < fragment.text.length){
			terms.push(regexify(fragment.text.slice(currentIdx, fragment.text.length), true, true));
		}

		return {re: terms.join(''), matchingGroups: groups};
	}


}, function(){
	window.SearchUtils = this;
});
