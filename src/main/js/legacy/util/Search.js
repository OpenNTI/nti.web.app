var Ext = require('extjs');
var XRegExp = require('xregexp');

module.exports = exports = Ext.define('NextThought.util.Search', {

	ignoredWordsRe: /\b(a|an|and|are|as|at|be|but|by|for|if|in|into|is|it|no|not|of|on|or|the|to|was)\b/ig,

	splitWhitespaceRe: /\W+/,

	trimRe: /^["'\s]+|["'\s]+$/ig,
	trimPunctuationReStr: '[\\?!()"\'`{}\\[\\]:;,\\.\\^%&#\\*@$&\\+-<>=_~\\s]', //This matches the regex the DS uses

	//keep a cache of regex generated
	_regexcache: {},

	/**
	 * If we have a cached regex for str return it otherwhise generate it
	 * @param  {string} str the term to search for
	 * @param  {boolean} partial Set true to match the entire word not just the substring.
	 * @param  {boolean} wholeWordOnly add \b to the end
	 * @return {RegExp} the regex that matches str
	 */
	getRegExCache: function (str, partial, wholeWordOnly) {
		var re = this._regexcache[str];

		if (re) { return re; }

		return this._regexcache[str] = this.searchRe(str, partial, wholeWordOnly);
	},

	 /*
	 *
	 * @param string
	 * @param partial Set true to match the entire word not just the substring.
	 * @return {RegExp}
	 */
	searchRe: function (string, partial, wholeWordOnly) {
		var tokens, str, bound = partial ? '[^\\s\\)\\(\\.]*' : '';

		str = string.replace(this.trimRe, '').replace(this.ignoredWordsRe, '');
		tokens = Ext.Array.map(str.split(this.splitWhitespaceRe), RegExp.escape);

		if (wholeWordOnly) {
			bound = '\\b';
		}

		tokens = Ext.Array.clean(tokens);
		if (tokens.length === 0) { tokens.push(string); } //Avoid searching for an empty string.

		return new RegExp(['(', bound, '(', tokens.join('|'), ')', bound, ')'].join(''), 'ig');
	},

	contentRegexFromSearchTerm: function (term, isPhrase) {

		if (isPhrase) {
			term = XRegExp.replace(term, new XRegExp('\\p{^L}+([^\\]]|$)', 'g'), '\\p{^L}+$1');
		}
		else {
			term = XRegExp.replace(term, new XRegExp('\\p{P}+', 'g'), '\\p{P}+');
		}
		return term;

	/*		//Do any regex escaping required
		term = term.replace(/[.*+?|()\[\]{}\\$\^]/g,'\\$&');

		//to make things like qoutes in the term match unicode apostrophe their
		//unicode counterparts in our content replace non alpha numeric characters
		//with a regex group that matches any other non alpha numeric character.
		//Note this potentially matches court's to court-s but that is such a rare
		//case this should be ok in practice.
		term = term.replace(/[^a-zA-Z0-9\s]/g, "[^a-zA-Z0-9\\s]");

		if(isPhrase){
			term = term.replace(/\s([^\]]|$)/g, '[^a-zA-Z0-9]+$1');
		}

		return term;*/
	},

	MATCH_SPLIT_REGEX: /<em>|<\/em>/g,

	extractMatchFromFragment: function (fragText, match) {
		return fragText.slice(match[0], match[1]);
	},


	extractTermFromMatch (match) {
		const parts = match.split(this.MATCH_SPLIT_REGEX);

		//With splitting on the em tags the odd items should be the terms between the tags
		return parts.reduce((acc, part, index) => {
			if (index % 2 === 1) {
				acc.push(part);
			}

			return acc;
		}, []);
	},


	contentRegexPartsForHit: function (hit) {
		var fragments = hit.get('Fragments'),
			terms = [];

		if (Ext.isEmpty(fragments)) {
			return null;
		}

		fragments.forEach((fragment, index) => {
			let fragTerms = [];

			if (!fragment.Matches || fragment.Matches.length === 0) {
				console.warn('No matches or text for fragment. Dropping', fragment);
			} else {
				fragment.Matches.forEach((match, idx) => {
					let term = this.extractTermFromMatch(match);

					if (term) {
						fragTerms = fragTerms.concat(term);
					}
				});

				terms = terms.concat(fragTerms);
			}
		});

		terms = Ext.Array.unique(terms);

		return terms;
	},

	contentRegexForSearchHit: function (hit, phraseSearch) {
		var terms, combinedRegex, escapedParts;

		terms = this.contentRegexPartsForHit(hit);

		if (!Ext.isEmpty(terms)) {
			escapedParts = Ext.Array.map(terms, function (item) {
				return this.contentRegexFromSearchTerm(item, phraseSearch);
			}, this);
			combinedRegex = new XRegExp(escapedParts.join('|'), 'ig');
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
	 * at 1.  Example;	a fragment of "the brown fox" with a match corresponding to "brown" will
	 * return the following. {re: /(the )(brown)( fox)/, matchingGroups: [2]}
	 */
	contentRegexForFragment: function (fragment, phraseSearch, captureMatches) {
		var sortedMatches, currentIdx = 0, terms = [], groups = [], currentCapture = 1, me = this;

		function regexify (text, phrase, noCapture) {
			var re = me.contentRegexFromSearchTerm(text, phrase);
			if (noCapture) {
				return re;
			}
			currentCapture++;
			return '(' + re + ')';
		}

		if (!fragment) {
			return null;
		}

		if (!captureMatches) {
			return new XRegExp(this.contentRegexFromSearchTerm(fragment.text, true), 'ig');
		}

		if (Ext.isEmpty(fragment.matches)) {
			return null;
		}

		sortedMatches = fragment.matches.slice();
		sortedMatches.sort(function (a, b) {return a[0] - b[0];});

		Ext.each(sortedMatches, function (match, idx) {
			var term,
			//Attempt to detect bad data from the server
				next = idx + 1 < sortedMatches.length ? sortedMatches[idx + 1] : [Infinity, Infinity];
			if (next[0] < match[1]) {
				console.warn('Found a match that is a subset of a previous match.  Server breaking its promise?', sortedMatches);
				return true; //continue
			}

			//slice from current index up to the match. this is a none
			//match part
			if (currentIdx < match[0]) {
				terms.push(regexify(fragment.text.slice(currentIdx, match[0]), true));
			}
			groups.push(currentCapture);
			//Now snag the actual match
			terms.push(regexify(this.extractMatchFromFragment(fragment.text, match), phraseSearch));

			//update current
			currentIdx = match[1];
			return true;
		}, this);

		//snag what is left
		if (currentIdx < fragment.text.length) {
			terms.push(regexify(fragment.text.slice(currentIdx, fragment.text.length), true, true));
		}

		return {re: new XRegExp(terms.join(''), 'ig'), matchingGroups: groups};
	}


}).create();
