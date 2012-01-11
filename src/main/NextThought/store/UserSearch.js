Ext.define('NextThought.store.UserSearch',{
	extend: 'Ext.data.Store',
	requires: [
		'NextThought.proxy.UserSearch'
	],

	model: 'NextThought.model.UserSearch',
	proxy: {
		type: 'usersearch',
		model: 'NextThought.model.UserSearch'
	}
});
