Ext.define('NextThought.view.widgets.classroom.Moderation', {
	extend:'NextThought.view.content.Panel',
    alias: 'widget.classroom-moderation',
    requires: [
        'NextThought.view.widgets.chat.OccupantsList',
        'NextThought.view.widgets.chat.Log'
    ],

	cls: 'nti-classroom-moderation',

    layout: 'border',

    items: [
       {
           //xtype: 'chat-friends-view'
           title: 'Occupants',
           xtype: 'chat-occupants-list',
           width: 150,
           region: 'west',
           split: true
       },
       {
           xtype: 'chat-log-view',
           title: 'moderation',
           moderated: true,
           region: 'center'
       }
    ]
});