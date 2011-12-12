
Ext.define('NextThought.model.GenericObject', {
    extend: 'NextThought.model.Base',
	requires: [
		'NextThought.proxy.Rest'
	],
	fields: [
		{ name: 'Creator', type: 'string'},
		{ name: 'Class', type: 'string' },
		{ name: 'ContainerId', type: 'string'},
		{ name: 'text', type: 'string' },
		{ name: 'sharedWith', type: 'UserList' }
	]
});
