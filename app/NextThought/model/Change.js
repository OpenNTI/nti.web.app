Ext.define('NextThought.model.Change', {
    extend: 'Ext.data.Model',
    idProperty: 'OID',
    fields: [
        { name: 'id', mapping: 'ID', type: 'int' },
        { name: 'OID', type: 'string' },
        { name: 'Class', type: 'string' },
        { name: 'ChangeType', type: 'string' },
        { name: 'Last Modified', type: 'date', dateFormat: 'timestamp' },
        { name: 'Creator', type: 'string' },
        { name: 'Item', type: 'auto' }
    ],
    getModelName: function() {
        return 'Change';
    }
});