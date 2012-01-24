Ext.define('NextThought.view.widgets.classroom.Moderation', {
	extend:'NextThought.view.content.Panel',
	alias: 'widget.classroom-moderation',
	requires: [
		'NextThought.view.widgets.chat.OccupantsList',
		'NextThought.view.widgets.chat.Log',
		'NextThought.view.widgets.classroom.ResourceView'
	],

	cls: 'nti-classroom-moderation',

	layout: {type: 'hbox', align: 'stretch'},
	border: false,

	items: [
		{
			title: 'Occupants',
			xtype: 'chat-occupants-list',
			flex: 1,
			autoHide: false
		},
		{
			title: 'Resources',
			flex: 1,
			items: [
				{
					xtype: 'classroom-resource-view',
					emptyText: 'No Resources'
				}
			]
		}
	]
});
