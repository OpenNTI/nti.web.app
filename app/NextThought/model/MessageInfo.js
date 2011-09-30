Ext.define('NextThought.model.MessageInfo', {
    extend: 'NextThought.model.Base',
    idProperty: 'ID',
    fields: [
        { name: 'ID', type: 'string'},
        { name: 'Class', type: 'string', defaultValue: 'MessageInfo'},
        { name: 'Creator', type: 'string' },
        { name: 'inReplyTo', type: 'string' },
        { name: 'Body', type: 'string', defaultValue: '' },
        { name: 'channel', type: 'string' },
        { name: 'ContainerId', type: 'string' },
        { name: 'recipients', type: 'auto' },
        { name: 'Last Modified', type: 'date', dateFormat: 'timestamp', defaultValue: new Date() }
    ],
    getModelName: function() {
        return 'MessageInfo';
    }
});
