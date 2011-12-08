Ext.define('NextThought.model.FriendsList', {
    extend: 'NextThought.model.Base',
	requires: [
		'NextThought.proxy.Rest'
	],
	idProperty: 'OID',
	mimeType: 'application/vnd.nextthought.friendslist',
	fields: [
		{ name: 'Last Modified', type: 'date', dateFormat: 'timestamp' },
		{ name: 'id', mapping: 'ID', type: 'string' },
		{ name: 'OID', type: 'string' },
		{ name: 'NTIID', type: 'string' },
		{ name: 'Class', type: 'string' },
		{ name: 'Creator', type: 'string' },
		{ name: 'Username', type: 'string' },
		{ name: 'alias', type: 'string' },
		{ name: 'realname', type: 'string' },
		{ name: 'avatarURL', type: 'string' },
		{ name: 'ContainerId', type: 'string'},
		{ name: 'friends', type: 'UserList' }
	],

	getModelName: function() {
		return 'Group';
    },

    destroy: function() {
        this.set('friends', []);

        this.callParent(arguments);
    }

});
