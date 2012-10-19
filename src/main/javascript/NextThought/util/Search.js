Ext.define('NextThought.util.Search',{
	singleton: true,

	ignoredWordsRe: /\b(a|an|and|are|as|at|be|but|by|for|if|in|into|is|it|no|not|of|on|or|the|to|was)\b/ig,

	splitWhitespaceRe: /\W+/,

	trimRe: /^["'\s]+|["'\s]+$/ig,

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
				fragment.matches.sort(function(a, b){return b[0] - a[0];});
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
			escapedParts = [];
			Ext.Array.each(terms, function(term){
				//Do any regex escaping required
				term = term.replace(/[.*+?|()\[\]{}\\$\^]/g,'\\$&');

				//to make things like qoutes in the term match unicode apostrophe their
				//unicode counterparts in our content replace non alpha numeric characters
				//with a regex group that matches any other non alpha numeric character.
				//Note this potentially matches court's to court-s but that is such a rare
				//case this should be ok in practice.
				term = term.replace(/[^a-zA-Z0-9 ]/g, "[^a-zA-Z0-9 ]");

				if(phraseSearch){
					term = term.replace(/\s([^\]])/g, '[\\.,-\\/#!$%\\^&\\*;:{}=\\-_`~()\\s]+$1');
				}

				escapedParts.push(term);
			});
			combinedRegex = new RegExp(escapedParts.join('|'), 'ig');
		}

		return combinedRegex;
	}

}, function(){
	window.SearchUtils = this;
});
