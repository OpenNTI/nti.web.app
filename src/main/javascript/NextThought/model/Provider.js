Ext.define(	'NextThought.model.Provider', {
	fields: [
		{ name: 'Classes', type: 'collectionItem' },
		{ name: 'Communities', type: 'UserList' },
		{ name: 'NotificationCount', type: 'int' },
		{ name: 'Presence', type: 'string' },
		{ name: 'Username', type: 'string' },
		{ name: 'accepting', type: 'UserList' },
		{ name: 'alias', type: 'string' },
		{ name: 'avatarURL', type: 'string' },
		{ name: 'following', type: 'UserList' },
		{ name: 'ignoring', type: 'UserList' },
		{ name: 'lastLoginTime', type: 'date', dateFormat: 'timestamp' },
		{ name: 'realname', type: 'string' }

	],
	extend: 'NextThought.model.Base',
	idProperty: 'ID'
});
