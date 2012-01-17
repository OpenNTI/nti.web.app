Ext.define('NextThought.view.widgets.classroom.Moderation', {
	extend:'NextThought.view.content.Panel',
	alias: 'widget.classroom-moderation',
	requires: [
		'NextThought.view.widgets.chat.OccupantsList',
		'NextThought.view.widgets.chat.Log',
		'NextThought.view.widgets.classroom.Attachments'
	],

	cls: 'nti-classroom-moderation',

	layout: {type: 'hbox', align: 'stretch'},
	border: false,
	//defaults: {border: false},

	items: [
		{
			title: 'Occupants',
			xtype: 'chat-occupants-list',
			flex: 1,
			autoHide: false
		},
		{
			xtype: 'classroom-attachments-view',
			title: 'attachments',
			flex: 1
		}
	]
});
