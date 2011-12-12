Ext.define(	'NextThought.model.UserSearch', {
    extend: 'NextThought.model.Base',
    requires: [
		'NextThought.proxy.UserSearch'
    ],
    idProperty: 'Username',

    fields: [
        { name: 'Class', type: 'string', defaultValue: 'User' },
        { name: 'Username', type: 'string' },
        { name: 'alias', type: 'string' },
        { name: 'realname', type: 'string' },
        { name: 'avatarURL', type: 'string' }
    ],

    getModelName: function() {
        return 'User (Search)';
    }
});
