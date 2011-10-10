Ext.define('NextThought.model.Community', {
    extend: 'NextThought.model.Base',
    idProperty: 'Username',
    fields: [
        { name: 'id', mapping: 'ID', type: 'string' },
        { name: 'OID', type: 'string' },
        { name: 'Class', type: 'string' },
        { name: 'Last Modified', type: 'date', dateFormat: 'timestamp' },
        { name: 'Username', type: 'string' },
        { name: 'alias', type: 'string' },
        { name: 'realname', type: 'string' },
        { name: 'avatarURL', type: 'string' }
    ],
    getModelName: function() {
        return 'Community';
    }
});