Ext.define('NextThought.view.widgets.chat.PinnedMessageView', {
	extend:'Ext.panel.Panel',
    alias: 'widget.chat-pinned-message-view',
    requires: [
    ],

    layout: 'anchor',

    initComponent: function() {
        this.callParent(arguments);

        //check to see if we are a mod or not, display clear button, or not.
        if (this.showClear)
            this.addDocked(
                {
                    xtype: 'toolbar',
                    dock: 'bottom',
                    items: {
                        text: 'clear'
                    }
                }
            );
    }

});
