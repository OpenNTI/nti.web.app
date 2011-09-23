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
                    xtype: 'textfield',
                    chatentry: true
                }

            ]
        },
        {
            region: 'east',border: true,
            xtype: 'chat-occupants-list'
        },
        {
            region: 'west',
            minWidth: 250,
            hidden: true,
            split: true,
            layout: 'fit'

        }
    ],



    initComponent:function() {
        this.callParent(arguments);
        this.down('chat-occupants-list').setOccupants(this.roomInfo.get('Occupants'));

        this.roomInfo.on('changed', this.changed, this);
    },

    afterRender: function() {
        this.callParent(arguments);
        this.down('textfield[chatentry]').focus();
    },

    changed: function(ri) {
        this.roomId = ri.getId();
        this.roomInfo = ri;
        this.roomInfo.on('changed', this.changed, this);
        //this.down('chat-occupants-list').setOccupants(this.roomInfo.get('Occupants'));
    },

    openModerationPanel: function() {
        var cmp = this.down('panel[region=west]');
        cmp.add({ xtype: 'chat-log-view', moderated:  true, title: 'Moderated' });
        cmp.setWidth(250);

        cmp.show();

        this.down('textfield[chatentry]').focus();
    }
}); 