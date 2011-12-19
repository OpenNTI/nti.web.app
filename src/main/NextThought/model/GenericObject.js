Ext.define('NextThought.model.GenericObject', {
    extend: 'NextThought.model.Base',
	requires: [
		'NextThought.proxy.Rest'
	],
	fields: [
		{ name: 'text', type: 'string' },
		{ name: 'sharedWith', type: 'UserList' }
	]
});
