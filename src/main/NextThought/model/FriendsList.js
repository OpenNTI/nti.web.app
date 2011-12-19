Ext.define('NextThought.model.FriendsList', {
    extend: 'NextThought.model.Base',
	requires: [
		'NextThought.proxy.Rest'
	],
	fields: [
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

    destroy: function() {
        this.set('friends', []);
        this.callParent(arguments);
    }

});
