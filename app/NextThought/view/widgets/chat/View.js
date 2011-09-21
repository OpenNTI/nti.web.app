Ext.define('NextThought.view.widgets.chat.View', {
	extend:'Ext.panel.Panel',
    alias: 'widget.chat-view',

    requires: [
        'NextThought.view.widgets.chat.Log',
        'NextThought.view.widgets.chat.OccupantsList'
    ],

    layout: 'border',
    border: false,
    defaults: {border: false, defaults: {border: false}},

    items:[
        {
            region: 'center',
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

            ]
        },
        {
            region: 'east',border: true,
            xtype: 'chat-occupants-list'
        }
    ],



    initComponent:function() {
        this.callParent(arguments);

        this.down('chat-occupants-list').setOccupants(this.roomInfo.get('Occupants'));
    }
}); 