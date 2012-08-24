Ext.define('NextThought.util.Search',{
	singleton: true,

	ignoredWordsRe: /\b(a|an|and|are|as|at|be|but|by|for|if|in|into|is|it|no|not|of|on|or|the|to|was)\b/ig,

	splitWhitespaceRe: /\W+/,

	trimRe: /^["'\s]+|["'\s]+$/ig,

	searchRe: function(string){
		var tokens, str;
		string = string.replace(this.trimRe,'');
		str = string.replace(this.ignoredWordsRe,'');
		tokens = Ext.Array.map(str.split(this.splitWhitespaceRe), RegExp.escape);
		
		tokens = Ext.Array.clean(tokens);
		if(tokens.length === 0){ tokens.push(string); } //Avoid searching for an empty string.
		 
		return new RegExp([ '([^\\W]*', tokens.join('|'), '[?^\\W]*)' ].join(''), 'ig');
	}


}, function(){
	window.SearchUtils = this;
});