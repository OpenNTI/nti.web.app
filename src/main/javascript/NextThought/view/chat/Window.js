Ext.define('NextThought.view.chat.Window', {
	extend:'NextThought.view.Window',
	alias:'widget.chat-window',

	requires:[
		'NextThought.view.chat.View',
		'NextThought.view.chat.Gutter'
	],

	cls:'chat-window no-gutter',
	ui:'chat-window',
    focusOnToFront: false,
	minimizable:true,

    width:280,
    minWidth:250,

    height:300,
    minHeight:250,

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
		},
        'flag-for-moderation':{
            tip:'Flag as Inappropriate',
            handler:'onFlagToolClicked'
        }
	},

	initComponent:function () {
		this.callParent(arguments);

        this.defaultFocus = this.down('chat-entry');

		var entry = this.down('chat-entry');
		if (!this.roomInfo) {
			Ext.Error.raise('roomInfo required');
		}
		this.on({
			scope: this,
			'close' : this.dragMaskOff,
			'hide'  : this.dragMaskOff
		});

		this.setChatStatesMap();
		this.roomInfoChanged(this.roomInfo);
	},


	roomInfoChanged:function (roomInfo) {
		if (!this.roomInfo) {
			return;
		}  //Only do this if it's there.

		var list = this.down('chat-gutter'),
			me = this,
			newOccupants = roomInfo.get('Occupants'),
			oldOccupants = this.roomInfo.get('Occupants'),
			whoLeft = Ext.Array.difference(oldOccupants, newOccupants),
			isGroupChat = this.roomInfo.get('Occupants').length > 2;

		//Even though the occupants list changes, the original occupants stays the same.
		roomInfo.setOriginalOccupants(this.roomInfo.getOriginalOccupants());
		//stop listening on old room info, reassign and start listening again.
		this.roomInfo.un('changed', this.roomInfoChanged, this);
		this.roomInfo = roomInfo;
		this.roomInfo.on('changed', this.roomInfoChanged, this);
		this.roomInfoHash = IdCache.getIdentifier(roomInfo.getId());

		if(newOccupants && newOccupants.length === 1 && isMe(newOccupants[0])){
			this.down('chat-entry').disable();
			this.down('chat-log-view').addStatusNotification("You are the ONLY one left in the chat. Your messages will not be sent.");
		} else{
			this.down('chat-entry').enable();
		}

		if(newOccupants.length > 1){
			UserRepository.getUser(roomInfo.get('Occupants'), function (users) {
				me.setTitleInfo(users);
				list.updateList(users);
			});
		} else{
			console.log('Users who left the chat: ', whoLeft);
			Ext.Array.each(whoLeft, function(aUser){
				me.updateDisplayState(aUser, 'GONE', isGroupChat);
			});
		}
	},


	afterRender:function () {
		this.callParent(arguments);

		var me = this;

		this.dropZone = Ext.dd.DropZone.create(this.getEl(), {

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

		if(Ext.isWebKit){
			//changing the visibilty of the gutter causes WebKit to fail to draw the window...lets toggle some stuff to trigger it to come back.
			this.mask();
			Ext.defer(this.unmask,100,this);
		}

		//TODO: actually show an interface to add people to the conversation instead of playing with the gutter.
	},


    onFlagToolClicked: function(){
        var logView = this.down('chat-log-view'),
            chatView = this.down('.chat-view'),
            btn = this.el.down('.flag-for-moderation');

        logView.toggleModerationPanel();
        chatView.toggleModerationButtons();
        btn.toggleCls('moderating');
    },

	setTitleInfo: function(users){
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
			title = Ext.String.format('Chat ({0})', title.length);
		}

		this.setTitle(title);
	},

	updateDisplayState: function( targetUser, state, isGroupChat){
		UserRepository.getUser(targetUser, function(u){
			var name = u.getName(), txt,
				displayState = this.chatUserStatesMap[state] || state;
			if(isGroupChat){
				this.down('chat-gutter').setChatState(displayState, name);
			}
			else if(!isGroupChat && !isMe(targetUser)) {
				txt = Ext.String.ellipsis(name, 16, false) + ' is ' + displayState;
				this.setTitle(txt);
			}
		}, this);
	},

	setChatStatesMap: function(){
		this.chatUserStatesMap = { 'composing': 'typing', 'inactive' : 'idle', 'gone' : 'away', 'active': 'active' };
	},

	disableChat:function () {
		this.down('chat-log-view').setDisabled(true);
		this.down('chat-entry').setDisabled(true);
	},


	left:function () {
		this.down('chat-entry').destroy();
	},


    accept: function(b){
        this.chatAccepted = b;
    },


    hasBeenAccepted: function(){
        return this.chatAccepted;
    },


	show: function(dontFocus){
		this.callParent();
		if(!dontFocus){
			this.down('chat-entry').focus(100);
		}
	}
});
