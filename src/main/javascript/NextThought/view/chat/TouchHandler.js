Ext.define('NextThought.view.chat.TouchHandler', {
    extend: 'NextThought.modules.TouchHandler',

    alias: 'chat.touchHandler',

    getPanel: function() {
        return this.container.getEl()
                             .down('.chat-log-view > :first');
    }
});