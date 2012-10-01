Ext.define('NextThought.view.chat.Window', {
	extend:'NextThought.view.Window',
	alias:'widget.chat-window',

	requires:[
		'NextThought.view.chat.View',
		'NextThought.view.chat.Gutter'
	],

	cls:'chat-window no-gutter',
	ui:'chat-window',
	minimizable:true,
	minWidth:250,
	minHeight:200,
	height:200,
	width:250,

	title:'chat',

	layout:{
		type:'hbox',
		align:'stretch'
	},

	items:[
		{xtype:'chat-view', flex:1}
	],

	dockedItems:[
		{xtype:'chat-gutter', dock:'left', hidden:true}
	],


	tools:{
		'add-people':{
			tip:'View occupants',
			handler:'addPeople'
		}
	},

	initComponent:function () {
		this.callParent(arguments);

		if (!this.roomInfo) {
			Ext.Error.raise('roomInfo required');
		}
		this.roomInfoChanged(this.roomInfo);
	},


	roomInfoChanged:function (roomInfo) {
		if (!this.roomInfo) {
			return;
		}  //Only do this if it's there.

		//stop listening on old room info, reassign and start listening again.
		this.roomInfo.un('changed', this.roomInfoChanged, this);
		this.roomInfo = roomInfo;
		this.roomInfo.on('changed', this.roomInfoChanged, this);
		this.roomInfoHash = IdCache.getIdentifier(roomInfo.getId());

		var list = this.down('chat-gutter');
		var me = this;


		UserRepository.getUser(roomInfo.get('Occupants'), function (users) {
			me.setTitle(users);
			list.updateList(users);
		});
	},


	afterRender:function () {
		this.callParent(arguments);

		var me = this;

		this.dropZone = Ext.create('Ext.dd.DropZone', this.getEl(), {

			getTargetFromEvent:function (e) {
				return e.getTarget('.chat-window');
			},
			onNodeEnter:function (target, dd, e, data) {
				Ext.fly(target).addCls('target-hover');
			},
			onNodeOut:function (target, dd, e, data) {
				Ext.fly(target).removeCls('target-hover');
			},

			onNodeOver:function (target, dd, e, data) {
				if (data && data.Username) {
					return Ext.dd.DropZone.prototype.dropAllowed;
				}
			},

			onNodeDrop:function (target, dd, e, data) {
//				me.fireEvent('add-people', me, [data.username]);
				return true;
			}
		});
	},


	addPeople:function () {
		//this doesn't do what it should, its only toggling the gutter to play with the tool wiring.
		var list = this.down('chat-gutter');
		if (list.isHidden()) {
			list.show();
		} else {
			list.hide();
		}
		//TODO: actually show an interface to add people to the conversation instead of playing with the gutter.
	},


	setTitle:function (users) {
		var title = [];

		Ext.each(users, function (u) {
			if (!isMe(u)) {
				title.push(u.getName());
			}
		});

		if (title.length === 1) {
			title = title[0];
		}
		else {
			title = Ext.String.format('Group Chat ({0})', title.length);
		}

		this.callParent([title]);
	},


	disableChat:function () {
		this.down('chat-log-view').setDisabled(true);
		this.down('chat-entry').setDisabled(true);
	},


	left:function () {
		this.down('chat-entry').destroy();
	}
});
