Ext.define('NextThought.model.Note', {
    extend: 'NextThought.model.Base',
	requires: [
		'NextThought.proxy.Rest'
	],
	mimeType: 'application/vnd.nextthought.note',
	fields: [

		{ name: 'inReplyTo', type: 'string' },
		{ name: 'references', type: 'auto', defaultValue: [] },
		{ name: 'Class', type: 'string', defaultValue: 'Note' },
		{ name: 'anchorPoint', type: 'string' },
		{ name: 'anchorType', type: 'string', defaultValue: 'previousPreviousName'},
		{ name: 'left', type: 'int' },
		{ name: 'top', type: 'int' },
		{ name: 'body', type: 'auto' },
		{ name: 'color', type: 'string', defaultValue: 'yellow' },
		{ name: 'Creator', type: 'string'},
		{ name: 'ContainerId', type: 'string'},
		{ name: 'sharedWith', type: 'UserList' }
	],
	proxy: {
		type: 'nti',
		model: 'NextThought.model.Note'
	},

	getModelName: function() {
		return 'Note';
	},

	getAnchorForSort: function(){
		return this.get('anchorPoint');
	}
});
