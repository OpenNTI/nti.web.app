Ext.define('NextThought.view.chat.Window',{
	extend: 'NextThought.view.Window',
	alias: 'widget.chat-window',

	requires: [
		'NextThought.view.chat.View',
		'NextThought.view.chat.Gutter'
	],

	cls: 'chat-window',
	ui: 'chat-window',
	minWidth: 285,
	minHeight: 250,
	height: 250,

	title: 'chat',

	layout: {
		type: 'hbox',
		align: 'stretch'
	},

	items: [
		{xtype:'chat-view', flex: 1}
	],

	dockedItems: [
		{xtype:'chat-gutter', dock: 'left'}
	],

	initComponent: function(){
		this.callParent(arguments);

		this.setPosition(
			Ext.dom.Element.getViewportWidth() - 305,
			Ext.dom.Element.getViewportHeight() - 270 );

		if(!this.roomInfo){
			Ext.Error.raise('roomInfo required');
		}
		this.roomInfoChanged(this.roomInfo);
	},


	roomInfoChanged: function(roomInfo){
		if (!this.roomInfo){return;}  //Only do this if it's there.

//		//Just checking to see if we got the correct room info
//		if (roomInfo.getId() !== this.roomInfo.getId()) {
//			console.error('Got a RoomInfo change event for a RoomInfo that has a different ID, current', this.roomInfo, 'new', roomInfo);
//			return;
//		}
		//stop listening on old room info, reassign and start listening again.
		this.roomInfo.un('changed', this.roomInfoChanged, this);
		this.roomInfo = roomInfo;
		this.roomInfo.on('changed', this.roomInfoChanged, this);
		this.roomInfoHash = IdCache.getIdentifier(roomInfo.getId());

		var list = this.down('chat-gutter');

		console.log('RoomInfo',roomInfo.data);
		UserRepository.getUser(roomInfo.get('Occupants'),function(users){
			list.updateList(users);
		});
	},


	afterRender: function(){
		this.callParent(arguments);

		var me = this;

		this.dropZone = Ext.create('Ext.dd.DropZone', this.getEl(), {

			getTargetFromEvent: function(e) { return e.getTarget('.chat-window'); },
			onNodeEnter: function(target, dd, e, data){ Ext.fly(target).addCls('target-hover'); },
			onNodeOut: function(target, dd, e, data){ Ext.fly(target).removeCls('target-hover'); },

			onNodeOver: function(target, dd, e, data){
//				if(data && data.Username) {
					return Ext.dd.DropZone.prototype.dropAllowed;
//				}
			},

			onNodeDrop: function(target, dd, e, data){
				me.fireEvent('add-people', me, [data.username]);
				return true;
			}
		});
	},


	disableChat: function(){
		this.down('chat-log-view').setDisabled(true);
		this.down('chat-entry').setDisabled(true);
	},


    left: function() {
		this.down('chat-entry').destroy();
    }
});
