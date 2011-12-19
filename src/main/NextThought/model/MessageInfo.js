Ext.define('NextThought.model.MessageInfo', {
    extend: 'NextThought.model.Base',
    fields: [
        { name: 'inReplyTo', type: 'string' },
        { name: 'Status', type: 'string' },
        { name: 'body', type: 'auto', defaultValue: [''] },
        { name: 'channel', type: 'string' },
        { name: 'recipients', type: 'auto' }
    ]
});
