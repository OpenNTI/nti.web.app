Ext.define('NextThought.model.FriendsList', {
    extend: 'NextThought.model.Base',
	requires: [
		'NextThought.proxy.RestMimeAware'
	],
	idProperty: 'OID',
	mimeType: 'application/vnd.nextthought.friendslist',
	fields: [
		{ name: 'Class', type: 'string', defaultValue: 'FriendsList' },
		{ name: 'ContainerId', type: 'string', defaultValue: 'FriendsLists'},
		{ name: 'CreatedTime', type: 'date', dateFormat: 'timestamp' },
		{ name: 'Creator', type: 'string' },
		{ name: 'ID', type: 'string' },
        { name: 'NTIID', type: 'string' },
		{ name: 'Last Modified', type: 'date', dateFormat: 'timestamp' },
		{ name: 'MimeType', type: 'string' },
		{ name: 'OID', type: 'string' },
		{ name: 'Username', type: 'string' },
		{ name: 'alias', type: 'string' },
		{ name: 'avatarURL', type: 'string' },
		{ name: 'friends', type: 'UserList' },
		{ name: 'href', type: 'string' },
		{ name: 'realname', type: 'string' },
		{ name: 'Links', type: 'links', defaultValue: [] }
	],
	proxy: {
		type: 'nti-mimetype',
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
