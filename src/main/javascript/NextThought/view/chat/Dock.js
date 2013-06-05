Ext.define('NextThought.view.chat.Dock',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.chat-dock',
	id: 'chat-dock',//there should be ONLY ONE instance of this.

	title: 'Chats',

	ui: 'chat-dock',
	cls: 'chat-dock',
	defaultType: 'chat-dock-item',
	collapseMode: 'header',
	collapsible: true,
	collapsed: true,
	maxHeight: 300,
	overflowX: 'hidden',
	overflowY: 'auto',
	animCollapse: false,
	listeners: {
		remove: 'updateAll',
		add: 'updateAll'
	},

	constructor: function(){
		this.floatCollapsedPanel = this.toggle;
		this.callParent(arguments);
	},

	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.down('header'),'click','toggle',this);
		this.mon(this.el,{
			scope: this,
			mouseout: 'startClose',
			mousein: 'stopClose',
			mouseover: 'stopClose',
			click: 'startClose'
		});

		this.countEl = new Ext.dom.CompositeElement([
			Ext.DomHelper.append( this.placeholder.getEl(), {cls:'count', html: '0'}),
			Ext.DomHelper.append( this.down('header').getEl(), {cls:'count', html: '0'})
			]);
	},

	toggle: function(){
		if(this.collapsed && this.items.length > 0){
			this.toggleCollapse();
		}
	},

	startClose: function(){
		this.stopClose();
		this.closeTimer = setTimeout(Ext.bind(this.collapse,this), 500);
	},

	stopClose: function(){
		clearTimeout(this.closeTimer);		
	},

	updateAll: function(){
		this.updateTitle();
		this.updateCount();
	},

	updateTitle: function(){
		this.setTitle((this.items.length === 0)? "Chats" : "Chats ("+this.items.length+")");
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

	constructor: function(){
		this.callParent(arguments);

		this.mon(this.associatedWindow.roomInfo,'changed', 'fillInInformation', this,{single:true});
		this.mon(this.associatedWindow,'notify','handleWindowNotify',this);
		this.lastUpdated = new Date();
		this.unread = 0;


		return this;
	},

	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.el,'click','onClick',this);
	},


	onAdded: function(ownerCt){
		this.callParent(arguments);
		this.mon(ownerCt,'expand','updateCount',this);
		this.mon(ownerCt,'expand','updateStatus',this);
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

		this.mon(roomInfo, 'changed', 'fillInInformation', this, {single:true});

		if(!this.rendered){ return; }

		UserRepository.getUser(roomInfo.get('Occupants'),function(users){
			var userCount = 1;

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

			});

			//blank out the rest
			for(userCount; userCount <= 4; userCount++){
				me['img'+userCount].setStyle({backgroundImage: undefined});
			}

			me.namesEl.update(usernames.join(', ')).set({'data-count':usernames.length});
			if(usernames.length > 1){
				me.namesEl.addCls('overflown');
			}

		});	
	},

	handleWindowNotify: function(msg){
		if( !this.associatedWindow.isVisible() && msg && msg.Creator && !isMe(msg.Creator)){
			this.unread++;
			this.updateCount();
		}
		this.lastUpdated = new Date();
		this.updateStatus();
		this.setVisible(true);
	},

	updateStatus: function(){
		var display, roominfo = this.associatedWindow.roomInfo,
			Status = this.lastUpdated,
			currentTime = new Date(),
			difference = new Date(currentTime - Status);


		if(!Status){
			console.log("No last Active yet");
		}

		display = difference.getMinutes()+"m "+difference.getSeconds()+"s";

		if(difference.getMinutes() < 10){
			display = "In Progress... "+display;
		}else{
			display = "Last message "+display+" ago";
		}

		if(this.statusEl){
			this.fillInInformation(roominfo);
			this.statusEl.update(display);
		}

	},

	updateCount: function(){
		if(this.countEl){ this.countEl.update(this.unread || ''); }
		this.fireEvent('count-updated');
	}


});
