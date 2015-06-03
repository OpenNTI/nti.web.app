Ext.define('NextThought.model.GenericObject', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'text', type: 'string' },
		{ name: 'sharedWith', type: 'UserList' }
	]
});
