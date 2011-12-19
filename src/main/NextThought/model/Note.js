Ext.define('NextThought.model.Note', {
    extend: 'NextThought.model.Base',

	fields: [
		{ name: 'inReplyTo', type: 'string' },
		{ name: 'references', type: 'auto', defaultValue: [] },
		{ name: 'anchorPoint', type: 'string' },
		{ name: 'anchorType', type: 'string', defaultValue: 'previousPreviousName'},
		{ name: 'left', type: 'int' },
		{ name: 'top', type: 'int' },
		{ name: 'body', type: 'auto' },
		{ name: 'sharedWith', type: 'UserList' }
	],

	getAnchorForSort: function(){
		return this.get('anchorPoint');
	}
});
