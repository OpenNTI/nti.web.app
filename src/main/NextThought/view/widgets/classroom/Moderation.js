Ext.define('NextThought.view.widgets.classroom.Moderation', {
	extend:'NextThought.view.content.Panel',
    alias: 'widget.classroom-moderation',
    requires: [
        'NextThought.view.widgets.chat.OccupantsList',
        'NextThought.view.widgets.chat.Log',
        'NextThought.view.widgets.classroom.Attachments'
    ],

	cls: 'nti-classroom-moderation',

    layout: 'border',
    border: false,
    defaults: {border: false},

    items: [
        {
            title: 'Occupants',
            xtype: 'chat-occupants-list',
            width: 150,
            region: 'west',
            split: true,
            autoHide: false
        },
        {
            xtype: 'chat-log-view',
            title: 'moderation',
            moderated: true,
            region: 'center',
            flex:3
        },
        {
            xtype: 'classroom-attachments-view',
            title: 'attachments',
            region: 'south',
            split: true,
            flex:2
        }
    ]
});
