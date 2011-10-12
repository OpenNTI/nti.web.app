Ext.define('NextThought.model.Change', {
    extend: 'NextThought.model.Base',
    idProperty: 'OID',
    fields: [
        { name: 'id', mapping: 'ID', type: 'int' },
        { name: 'OID', type: 'string' },
        { name: 'Class', type: 'string' },
        { name: 'ChangeType', type: 'string' },
        { name: 'Last Modified', type: 'date', dateFormat: 'timestamp' },
        { name: 'Creator', type: 'string' },
        { name: 'Item', type: 'singleItem' }
    ],
    getModelName: function() {
        return 'Change';
    }
});