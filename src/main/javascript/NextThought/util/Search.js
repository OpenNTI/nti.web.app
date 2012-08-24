Ext.define('NextThought.util.Search',{
	singleton: true,

	ignoredWordsRe: /\b(a|an|and|are|as|at|be|but|by|for|if|in|into|is|it|no|not|of|on|or|such|than|that|the|their|then|there|these|they|this|to||was|will|with)\b/ig,

	splitWhitespaceRe: /\W+/,

	trimRe: /^["'\s]+|["'\s]+$/ig,

	searchRe: function(string){
		var tokens;
		string = string.replace(this.trimRe,'').replace(this.ignoredWordsRe,'');
		tokens = Ext.Array.map(string.split(this.splitWhitespaceRe), RegExp.escape);

		return new RegExp([ '([^\\W]*', tokens.join('|'), '[?^\\W]*)' ].join(''), 'ig');
	}


}, function(){
	window.SearchUtils = this;
});