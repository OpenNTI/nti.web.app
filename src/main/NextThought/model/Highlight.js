Ext.define('NextThought.model.Highlight', {
    extend: 'NextThought.model.Base',
    requires: [
		'NextThought.proxy.Rest'
	],
	fields: [
		{ name: 'startXpath', type: 'string' },
		{ name: 'startAnchor', type: 'string' },
		{ name: 'startHighlightedFullText', type: 'string' },
		{ name: 'startHighlightedText', type: 'string' },
		{ name: 'startOffset', type: 'int' },
		{ name: 'endXpath', type: 'string' },
		{ name: 'endAnchor', type: 'string' },
		{ name: 'endHighlightedFullText', type: 'string' },
		{ name: 'endHighlightedText', type: 'string' },
		{ name: 'endOffset', type: 'int' },
		{ name: 'text', type: 'string' },
		{ name: 'sharedWith', type: 'UserList'}
	],
	proxy: {
		type: 'nti',
		model: 'NextThought.model.Highlight'
	},

	getAnchorForSort: function(){
		return this.get('startAnchor');
	}
});
