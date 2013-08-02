Ext.define('NextThought.view.forums.TouchHandler', {
    extend: 'NextThought.modules.TouchHandler',

    alias: 'forums.touchHandler',

    getPanel: function() {
            return this.container.getEl();
    }

});