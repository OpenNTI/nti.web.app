Ext.define('NextThought.view.chat.Dock',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.chat-dock',
	id: 'chat-dock',//there should be ONLY ONE instance of this.

	title: 'Chats',

	ui: 'chat-dock',
	cls: 'chat-dock',
	defaultType: 'chat-dock-item',
	listeners: {
		remove: 'updateCount'
	},

	afterRender: function(){
		this.callParent(arguments);

		this.countEl = Ext.DomHelper.append(
			this.down('header').getEl(), {cls:'count', html: '0'}, true);
	},

	add: function(){
		var result = this.callParent(arguments);
		
		if(result){
			if(Ext.isArray(result)){
				Ext.each(result,this.monitorDockItem,this);
			}else{
				this.monitorDockItem(result);
			}
		}
		return result;
	},

	monitorDockItem: function(cmp){
		this.mon(cmp,{
			scope: this,
			'count-updated': 'updateCount',
			destroy: 'updateCount',
			buffer: 1
		});
	},

	updateCount: function(){
		var total = 0;
		
		this.items.each(function(i){
			if(i && (i.isDestroying || i.destroyed)){
				return;
			}
			total += ((i && i.unread) || 0);
		});

		this.countEl.update(total || '0');
	}

});

Ext.define('NextThought.view.chat.DockItem',{
	extend: 'Ext.Component',
	alias: 'widget.chat-dock-item',
	cls: 'chat-dock-item',
	ui: 'chat-dock-item',

	hidden: true, //start out as hidden

	renderTpl: Ext.DomHelper.markup([
		{cls: 'avatars', cn: [
			{cls: 'img1 avatar'},
			{cls: 'img2 avatar'},
			{cls: 'img3 avatar'},
			{cls: 'img4 avatar'}
		]},
		{cls: 'count'},
		{cls: 'close'},
		{cls: 'wrap', cn: [
			{cls: 'names'},
			{cls: 'status'}
		]}
	]),

	renderSelectors: {
		'countEl': '.count',
		'closeEl': '.close',
		'namesEl': '.wrap .names',
		'statusEl': '.wrap .status',
		'avatarsEl': '.avatars',
		'img1': '.avatars .img1',
		'img2': '.avatars .img2',
		'img3': '.avatars .img3',
		'img4': '.avatars .img4'
	},

	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.el,'click','onClick',this);
		this.mon(this.associatedWindow.roomInfo,'update', 'fillInInformation', this);
		this.mon(this.associatedWindow,'notify','handleWindowNotify',this);
		this.lastUpdated = new Date();
		this.unread = 0;

		this.fillInInformation(this.associatedWindow.roomInfo);		
	},

	onClick: function(e){
		e.stopEvent();
		if(e.getTarget(".close")){
			this.unread = 0;
			this.updateCount();
			this.associatedWindow.close();
			return;
		}

		if(this.associatedWindow.isVisible()){
			this.associatedWindow.hide();
		}else{
			this.unread = 0;
			this.updateCount();
			this.associatedWindow.show();
		}
	},

	fillInInformation: function(roomInfo){
		var me = this,
			usernames = [];

		UserRepository.getUser(roomInfo.get('Occupants'),function(users){
			var userCount = 1;

			console.log(users);
			Ext.each(users,function(u){
				if(!isMe(u)){
					if(userCount <= 4){
						if(userCount > 1){
							me.avatarsEl.addCls('quad');
						}
						me['img'+userCount].setStyle({backgroundImage: 'url('+u.get('avatarURL')+')'});
						userCount++;
					}
					usernames.push(u.getName());
				}
				console.log(me);
			});
			me.namesEl.update(usernames.join(', ')).set({'data-count':usernames.length});
			if(usernames.length > 1){
				me.namesEl.addCls('overflown');
			}
			console.log(usernames);
		});	
		me.updateLastActive();
	},

	handleWindowNotify: function(msg){
		if( !this.associatedWindow.isVisible() && msg && msg.Creator && !isMe(msg.Creator)){
			this.unread++;
			this.updateCount();
		}
		this.lastUpdated = new Date();
		this.updateLastActive();
		this.setVisible(true);
	},

	updateLastActive: function(el){
		var display, roominfo = this.associatedWindow.roomInfo,
			lastActive = this.lastUpdated,
			currentTime = new Date(),
			difference = new Date(currentTime - lastActive);

		console.log(difference);

		if(!lastActive){
			console.log("No last Active yet");
		}

		display = difference.getMinutes()+"m "+difference.getSeconds()+"s";

		if(difference.getMinutes() < 10){
			this.statusEl.update("In Progress... "+display);
		}else{
			this.statusEl.update("Last message "+display+" ago");
		}

	},

	updateCount: function(){
		this.countEl.update(this.unread || '');
		this.fireEvent('count-updated');
	}


});
