Ext.define(	'NextThought.model.User', {
	extend: 'NextThought.model.Base',
	idProperty: 'Username',
	resolveUsers: true,
	fields: [
		{ name: 'lastLoginTime', type: 'date', dateFormat: 'timestamp' },
		{ name: 'NotificationCount', type: 'int' },
		{ name: 'Username', type: 'string' },
		{ name: 'Presence', type: 'string' },
		{ name: 'affiliation', type: 'string' },
		{ name: 'alias', type: 'string' },
		{ name: 'email', type: 'string' },
		{ name: 'realname', type: 'string' },
		{ name: 'avatarURL', type: 'AvatarURL' },
		{ name: 'accepting', type: 'UserList' },
		{ name: 'ignoring', type: 'UserList' },
		{ name: 'status', type: 'string' },
		{ name: 'following', type: 'UserList' },
		{ name: 'Communities', type: 'UserList' }
	],

	constructor: function() {
		var r = this.callParent(arguments);
		UserRepository.updateUser(this);
		return r;
	},


	getName: function(){
		return this.get('alias') || this.get('realname') || this.get('Username');
	}
});
