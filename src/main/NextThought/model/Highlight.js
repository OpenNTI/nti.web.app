
Ext.define('NextThought.model.Highlight', {
    extend: 'NextThought.model.Base',
    requires: [
		'NextThought.proxy.Rest'
	],
	mimeType: 'application/vnd.nextthought.highlight',
	fields: [
		{ name: 'Class', type: 'string', defaultValue: 'Highlight' },
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
		{ name: 'Creator', type: 'string'},
		{ name: 'color', type: 'string', defaultValue: 'yellow' },
		{ name: 'ContainerId', type: 'string'},
		{ name: 'text', type: 'string' },
		{ name: 'sharedWith', type: 'UserList'}
	],
	proxy: {
		type: 'nti-mimetype',
		model: 'NextThought.model.Highlight'
	},
	getModelName: function() {
        return 'Highlight';
    }
});
