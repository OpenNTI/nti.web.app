Ext.define('NextThought.model.UnresolvedFriend', {
	extend: 'NextThought.model.Base',
	alias: 'model.unresolved-user',
	idProperty: 'Username',
	fields: [
		{ name: 'Username', type: 'string' },
		{ name: 'avatarURL', type: 'string' }
	]
});
