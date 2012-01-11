Ext.define('NextThought.view.widgets.chat.View', {
	extend:'Ext.panel.Panel',
    alias: 'widget.chat-view',

    requires: [
        'NextThought.view.widgets.chat.Log',
        'NextThought.view.widgets.chat.OccupantsList',
        'NextThought.view.widgets.chat.ReplyTo',
        'NextThought.view.widgets.chat.OnDeck',
        'NextThought.view.widgets.chat.PinnedMessageView',
        'NextThought.util.Classroom',
        'NextThought.cache.IdCache'
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
                    border: false,
                    xtype: 'chat-reply-to',
                    mainEntry: true
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

    changed: function(ri) {
        if (!ri) return;

        this.roomId = IdCache.getIdentifier(ri.getId());
        this.roomInfo = ri;
        this.roomInfo.on('changed', this.changed, this);
        this.roomInfo.on('left-room', this.left, this);

        //upon the roominfo appearing, see if we should show the classroom button or not
        if (!this.up('classroom-content') && ClassroomUtils.isClassroomId(ri.get('ContainerId'))) {
            this.down('chat-reply-to').showClassroomButton();
        }
        else if (ClassroomUtils.isClassroomId(ri.get('ContainerId'))){
            this.down('[region=center]').add({xtype:'on-deck-view', hidden:true});
        }

        //stuff the occupants where they belong
        if (this.up('classroom-content')) {
            this.up('classroom-content').down('classroom-moderation').down('chat-occupants-list').setOccupants(this.roomInfo.get('Occupants'), this.roomId);
            this.down('chat-occupants-list').hide();
        }
        else {
            this.down('chat-occupants-list').setOccupants(this.roomInfo.get('Occupants'), this.roomId);
        }
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
    },

    getPinnedMessageView: function() {
        var v = this.down('chat-pinned-message-view');

        if (!v) {
            v = this.down('[region=center]').insert(0, {xtype: 'chat-pinned-message-view', showClear: this.el.hasCls('moderator')});
        }

        return v;
    }
}); 
