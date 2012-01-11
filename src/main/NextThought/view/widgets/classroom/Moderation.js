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
			layout: {
				type: 'hbox',
				align: 'stretch'
			},
			region: 'center',
			items: [
			{
				title: 'Occupants',
				xtype: 'chat-occupants-list',
				flex: 1,
				autoHide: false
			},
			{
				xtype: 'chat-log-view',
				title: 'moderation',
				flex: 2,
				moderated: true,
				hidden: true
			}]
		},
		{
			xtype: 'classroom-attachments-view',
			title: 'attachments',
			region: 'south',
			split: true
		}
	]
});
