Ext.define('NextThought.model.MessageInfo', {
    extend: 'NextThought.model.Base',
    fields: [
        { name: 'Class', type: 'string', defaultValue: 'MessageInfo'},
        { name: 'Creator', type: 'string' },
        { name: 'inReplyTo', type: 'string' },
        { name: 'Status', type: 'string' },
        { name: 'body', type: 'auto', defaultValue: [''] },
        { name: 'channel', type: 'string' },
        { name: 'ContainerId', type: 'string' },
        { name: 'recipients', type: 'auto' }
    ],
    getModelName: function() {
        return 'MessageInfo';
    }
});
