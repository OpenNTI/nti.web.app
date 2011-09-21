Ext.define('NextThought.model.MessageInfo', {
    extend: 'NextThought.model.Base',
    idProperty: 'MessageId',
    fields: [
        { name: 'MessageId', type: 'string'},
        { name: 'Class', type: 'string', defaultValue: 'MessageInfo'},
        { name: 'Sender', type: 'string' },
        { name: 'inReplyTo', type: 'string' },
        { name: 'Body', type: 'string' },
        { name: 'channel', type: 'string' },
        { name: 'rooms', type: 'auto' },
        { name: 'recipients', type: 'auto' },
        { name: 'Timestamp', type: 'date', dateFormat: 'timestamp' }
    ],
    getModelName: function() {
        return 'MessageInfo';
    }
});