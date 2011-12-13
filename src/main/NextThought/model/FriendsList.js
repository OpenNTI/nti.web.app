Ext.define('NextThought.model.FriendsList', {
    extend: 'NextThought.model.Base',
	requires: [
		'NextThought.proxy.Rest'
	],
	mimeType: 'application/vnd.nextthought.friendslist',
	fields: [
		{ name: 'Class', type: 'string', defaultValue: 'FriendsList' },
		{ name: 'ContainerId', type: 'string', defaultValue: 'FriendsLists'},
		{ name: 'CreatedTime', type: 'date', dateFormat: 'timestamp' },
		{ name: 'Creator', type: 'string' },
        { name: 'NTIID', type: 'string' },
		{ name: 'MimeType', type: 'string' },
		{ name: 'Username', type: 'string' },
		{ name: 'alias', type: 'string' },
		{ name: 'avatarURL', type: 'string' },
		{ name: 'friends', type: 'UserList' },
		{ name: 'href', type: 'string' },
		{ name: 'realname', type: 'string' }
	],
	proxy: {
		type: 'nti',
		model: 'NextThought.model.FriendsList'
	},

	getModelName: function() {
		return 'Group';
    },

    destroy: function() {
        this.set('friends', []);
        this.callParent(arguments);
    }

});
