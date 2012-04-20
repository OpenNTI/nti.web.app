Ext.define('NextThought.view.windows.ChatWindow', {
	extend: 'Ext.window.Window',
	alias : 'widget.chat-window',
	requires: [
		'Ext.button.Split',
		'Ext.tab.Panel',
		'NextThought.view.widgets.chat.View',
		'NextThought.view.widgets.chat.Friends',
		'NextThought.cache.IdCache'
	],

	width: 700,
	height: 350,
	closeAction: 'hide',
	maximizable:true,
	constrain: true,
	title: 'Chat',
	layout: 'border',
	cls: 'chat-window',

	dockedItems:[{
		dock: 'bottom',
		xtype: 'toolbar',
		items:[
			{
				iconCls: 'flag',
				disabled: true,
				menu: [],
				action: 'flagged',
				xtype: 'splitbutton',
				tooltip:'flagged messages'
			}//,
			//{text:'whispers'},
			//{text:'shadows'}
		]
	}],

	items: [
		{
			region: 'center',
			xtype: 'tabpanel',
		//},
		items:
		{
			//region: 'east',
			//collapsible: true,
			//split: true,
			//width: 200,
			title: 'Friends',
			xtype: 'chat-friends-view'
		}
		}
],


	addNewChat: function(roomInfo) {
		var id = IdCache.getIdentifier(roomInfo.getId()),
			tab = this.down('chat-view[roomId='+id+']'),
			v;
		if (!tab) {
			v = Ext.widget('chat-view', {
				title: ClassroomUtils.generateOccupantsString(roomInfo),
				xtype: 'chat-view',
				roomId: id,
				closable: true,
				roomInfo: roomInfo
			});
			v.changed(roomInfo);

			tab = this.down('tabpanel').add(v);
		}
		if (tab) {
			this.down('tabpanel').setActiveTab(tab);
		}
	},


	closeChat: function(roomInfo, disableExitRoom) {
		var id = IdCache.getIdentifier(roomInfo.getId()),
			tab = this.down('chat-view[roomId='+id+']');

		if (tab) {
			tab.disableExitRoom = disableExitRoom;
			tab.destroy(); //TODO: This causes the room to be left this receiving no more messages, we want to remove
			// the tab, but not leave the room in this case (switch to classroom)
		}
	}
});
