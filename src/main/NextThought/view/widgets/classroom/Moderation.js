Ext.define('NextThought.view.widgets.classroom.Moderation', {
	extend:'NextThought.view.content.Panel',
    alias: 'widget.classroom-moderation',
    requires: [
        'NextThought.view.widgets.chat.Friends',
        'NextThought.view.widgets.chat.Log'
    ],

	cls: 'nti-classroom-moderation',

    layout: 'border',

    items: [
       {
           //xtype: 'chat-friends-view'
           title: 'friends',
           xtype: 'chat-friends-view',
           width: 150,
           region: 'west',
           split: true
       },
       {
           //xtype: 'chat-log-view',
           title: 'moderation',
           xtype: 'panel',
          // moderated: true,
           region: 'center'
       }
    ]
});