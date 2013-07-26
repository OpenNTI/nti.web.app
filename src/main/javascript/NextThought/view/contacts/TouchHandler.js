Ext.define('NextThought.view.contacts.TouchHandler', {
    extend: 'NextThought.modules.TouchHandler',

    alias: 'contacts.touchHandler',

    getPanel: function() {
        return this.container.getEl()
            .down('.x-tabpanel-child{display!=none} > :first');
    }
});