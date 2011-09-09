
Ext.define('NextThought.model.QuizQuestion', {
    extend: 'Ext.data.Model',
    idProperty: 'OID',
    fields: [
        { name: 'Answers', type: 'auto' },
        { name: 'Class', type: 'string' },
        { name: 'id', mapping: 'ID', type: 'string' },
        { name: 'OID', type: 'string' },
        { name: 'Text', type: 'auto' }
    ],
    proxy: {
        type: 'memory'
    },
    getModelName: function() {
        return 'QuizQuestion';
    }
});
