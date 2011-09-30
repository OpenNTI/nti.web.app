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

        this.changed(this.roomInfo);

    },

    afterRender: function() {
        this.callParent(arguments);
        this.down('textfield[chatentry]').focus();
    },

    changed: function(ri) {
        this.roomId = ri.getId();
        this.roomInfo = ri;
        this.roomInfo.on('changed', this.changed, this);
        this.roomInfo.on('left-room', this.left, this);
        this.down('chat-occupants-list').setOccupants(this.roomInfo.get('Occupants'));
    },

    left: function() {
        this.down('textfield').destroy();
        this.down('chat-occupants-list').disable();
        this.roomInfo.clearListeners();
        delete this.roomInfo;
    },

    openModerationPanel: function() {
        var cmp = this.down('panel[region=west]');
        cmp.add({ xtype: 'chat-log-view', moderated:  true, title: 'Moderated' });
        cmp.setWidth(250);

        cmp.show();

        this.down('textfield[chatentry]').focus();
    }
}); 