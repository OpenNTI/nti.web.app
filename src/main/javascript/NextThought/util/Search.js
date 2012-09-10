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
		var tokens, str;
		str = string.replace(this.trimRe,'');
		str = string.replace(this.ignoredWordsRe,'');
		tokens = Ext.Array.map(str.split(this.splitWhitespaceRe), RegExp.escape),
		bound = partial?'[^\\s\\)\\(\\.]*':'';
		if(wholeWordOnly){
			bound = '\\b';
		}

		tokens = Ext.Array.clean(tokens);
		if(tokens.length === 0){ tokens.push(string); } //Avoid searching for an empty string.

		return new RegExp([ '(',bound,'(', tokens.join('|'), ')',bound,')' ].join(''), 'ig');
	}


}, function(){
	window.SearchUtils = this;
});
