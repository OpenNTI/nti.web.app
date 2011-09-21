
Ext.define('NextThought.model.QuizQuestion', {
    extend: 'NextThought.model.Base',
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
