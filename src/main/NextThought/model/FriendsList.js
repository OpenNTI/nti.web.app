Ext.define('NextThought.model.FriendsList', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'Username', type: 'string' },
		{ name: 'alias', type: 'string' },
		{ name: 'avatarURL', type: 'string' },
		{ name: 'friends', type: 'UserList' },
//		{ name: 'href', type: 'string' },
		{ name: 'realname', type: 'string' }
	],

	destroy: function() {
		this.set('friends', []);
		this.callParent(arguments);
	}

});
