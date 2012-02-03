Ext.define('NextThought.view.widgets.classroom.Management', {
	extend:'NextThought.view.content.Panel',
	alias: 'widget.classroom-management',
	requires: [
		'NextThought.view.widgets.classroom.LiveDisplay',
		'NextThought.view.widgets.chat.OccupantsList',
		'NextThought.view.widgets.classroom.ResourceView'
	],

	cls: 'nti-classroom-management',

	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	border: false,
	defaults: {
		border: false,
		defaults: {
			border: false
		}
	},


	initComponent: function() {
		this.callParent(arguments);

		this.add({xtype: 'live-display', height: 400, roomInfo: this.roomInfo});
		this.add({
				flex: 1,
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
						autoScroll: true,
						items: [
							{
								xtype: 'classroom-resource-view',
								emptyText: 'No Resources',
								viewGrid: true,
								readOnly: true
							}
						]
					}
				]}
			);
	}
});
