Ext.define('NextThought.view.widgets.chat.View', {
	extend:'Ext.panel.Panel',
    alias: 'widget.chat-view',

    requires: [
        'NextThought.view.widgets.chat.Log'
    ],

    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [
        {
            xtype: 'chat-log-view',
            flex:1
        },
        {
            cls: 'chat-entry',
            xtype: 'textfield'
        }

    ],

    initComponent:function() {
        this.callParent(arguments);
    }
});