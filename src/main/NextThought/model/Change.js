Ext.define('NextThought.model.Change', {
    extend: 'NextThought.model.Base',
    fields: [
        { name: 'Class', type: 'string' },
        { name: 'ChangeType', type: 'string' },
        { name: 'Creator', type: 'string' },
        { name: 'Item', type: 'singleItem' }
    ],
    getModelName: function() {
        return 'Change';
    }
});
