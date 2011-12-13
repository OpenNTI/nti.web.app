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
    },
    getItemValue: function(field) {
        var i = this.get('Item');

        if (!i) return null;

        return i.get(field);
    }
});
