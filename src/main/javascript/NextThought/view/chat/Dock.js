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
		afterRender: 'updateAll',
		add: 'updateAll',
		beforeadd:'synchronizeHeight',
		remove: 'updateAll'
	},

	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.down('header'),'click','slideOutFloatedPanel',this);
		this.placeholder.focus = Ext.emptyFn;

		//remove the default click handler
		this.placeholder.getEl().un('click',this.floatCollapsedPanel,this);

		//add hover instead
		this.mon(this.placeholder.getEl(),{
			scope: this,
			mouseover:'maybeExpand',
			mouseout: 'stopExpand'
		});


		this.countEl = new Ext.dom.CompositeElement([
			Ext.DomHelper.append( this.placeholder.getEl(), {cls:'count', html: '0'}),
			Ext.DomHelper.append( this.down('header').getEl(), {cls:'count', html: '0'})
			]);

		this.placeholder.getSize = function(){return {height:1};};
	},


	convertCollapseDir:function(){ return 'b'; },


	maybeExpand: function(){
		this.stopExpand();
		this.expanDelayTimer = Ext.defer(this.floatCollapsedPanel,750,this);
	},


	stopExpand: function(){
		clearTimeout(this.expanDelayTimer);
	},


	floatCollapsedPanel: function(){
		if(this.items.length > 0){
			this.addCls('open');
			this.fireEvent('peek');
			this.callParent();
		}
	},


	slideOutFloatedPanel: function(){
		this.removeCls('open');
		return this.callParent();
	},


	synchronizeHeight: function(){
		if( !this.floated && !this.isSliding ) { return; }

		var me = this,
			oldHeight = me.el.getHeight();

		function doSyncHeight(){
			var h = oldHeight - me.el.getHeight();
			if( h!==0 ){
				me.setY(me.getY()+h);
			}
		}

		this.on('afterlayout',doSyncHeight,this,{single:true});
	},


	onRemove: function(){
		this.synchronizeHeight();

		if(this.items.length === 0){
			this.slideOutTask.delay(10);
		}
		return this.callParent(arguments);
	},


	updateAll: function(){
		this.updateTitle();
		this.updateCount();
	},

	updateTitle: function(){

		var total = 0;
		this.items.each(function(o){
			if(o && o.isPresented){
				total++;
			}
		});

		this[total===0?'addCls':'removeCls']('hide-arrow');
		this.placeholder[total===0?'addCls':'removeCls']('hide-arrow');

		this.setTitle((total === 0)? "Chats" : "Chats ("+total+")");
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
			'made-visible': 'updateTitle', 
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

		this[total<1? 'removeCls':'addCls']('notice-me');
		this.placeholder[total<1? 'removeCls':'addCls']('notice-me');

		this.countEl.update(total || '');
		this.fireEvent('update-count',total);
	}

});

Ext.define('NextThought.view.chat.DockItem',{
	extend: 'Ext.Component',
	alias: 'widget.chat-dock-item',
	cls: 'chat-dock-item',
	ui: 'chat-dock-item',

	hidden: true, //start out as hidden

	renderTpl: Ext.DomHelper.markup([
		{cls: 'close','data-qtip':'Exit Chat'},
		{cls: 'avatars {avatarCls}', cn: [
			{cls: 'img1 avatar', style:{backgroundImage: '{img1}'} },
			{cls: 'img2 avatar', style:{backgroundImage: '{img2}'} },
			{cls: 'img3 avatar', style:{backgroundImage: '{img3}'} },
			{cls: 'img4 avatar', style:{backgroundImage: '{img4}'} }
		]},
		{cls: 'count'},
		{cls: 'wrap', cn: [
			{cls: 'names {namesCls}', html:'{names}', 'data-count':'{count}'},
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

		this.fillInInformation(this.associatedWindow.roomInfo);
		this.mon(this.associatedWindow,'notify','handleWindowNotify',this);
		this.lastUpdated = new Date();
		this.unread = 0;


		return this;
	},

	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.el,'click','onClick',this);
		this.fillInInformation(this.associatedWindow.roomInfo);
	},


	onAdded: function(ownerCt){
		this.callParent(arguments);
		this.mon(ownerCt,'peek','updateCount',this);
		this.mon(ownerCt,'peek','updateStatus',this);
		this.mon(ownerCt,'peek',function(){
			this.fillInInformation(this.associatedWindow.roomInfo);
		},this);
	},


	onClick: function(e){
		var me = this;
		e.stopEvent();
		if(e.getTarget(".close")){
			this.unread = 0;
			this.updateCount();
			this.associatedWindow.close();
			return;
		}


		if(!this.associatedWindow.isVisible()){
			this.unread = 0;
			this.updateCount();
			this.associatedWindow.show();
			Ext.defer(function(){
				me.associatedWindow.focus();
			}, 500);

		}
		else{
			this.associatedWindow.hide();
		}
	},


	fillInInformation: function(roomInfo){
		var me = this,
			occ = roomInfo.get('Occupants'),
			usernames = [];

		this.mon(roomInfo, 'changed', 'fillInInformation', this, {single:true});

		if(occ.length===1 && isMe(occ[0])){
			return;
		}

		UserRepository.getUser(roomInfo.get('Occupants'),function(users){
			var userCount = 1, data = {};

			Ext.each(users,function(u){
				var presence = Ext.getStore('PresenceInfo').getPresenceOf(u.getId());
				if(!isMe(u)){
					if(userCount <= 4){
						if(userCount > 1){
							data.avatarCls = 'quad';
							if( me.rendered ){
								me.avatarsEl.addCls(data.avatarCls);
							}
						}

						if(presence && presence.isOnline()){
							data['img'+userCount] = 'url('+u.get('avatarURL')+')';
							if( me.rendered ){
								me['img'+userCount].setStyle({backgroundImage: data['img'+userCount]});
							}
							userCount++;
						}
					}
					if(presence && presence.isOnline()){
						usernames.push(u.getName());
					}
				}

			});

			//blank out the rest
			for(userCount; userCount <= 4; userCount++){
				delete data['img'+userCount];
				if( me.rendered ){
					me['img'+userCount].setStyle({backgroundImage: undefined});
				}
			}

			Ext.apply(data,{
				names: usernames.join(', '),
				count: usernames.length
			});

			if(!me.rendered){
				me.renderData = Ext.apply(me.renderData||{},data);
				return;
			}

			me.namesEl.update(data.names).set({'data-count':data.count});
			if(usernames.length > 1){
				me.namesEl.addCls('overflown');
			}
		});
	},


	handleWindowNotify: function(msg){
		var reSetTitle = !this.isPresented;
		if( !this.associatedWindow.isVisible() && msg && msg.Creator && !isMe(msg.Creator)){
			this.unread++;
			this.updateCount();
		}

		this.lastUpdated = new Date();
		this.updateStatus();
		this.setVisible(true);
		this.isPresented = true;
		if(reSetTitle){
			this.fireEvent('made-visible');
		}
	},


	updateStatus: function(){
		var display, roomInfo = this.associatedWindow.roomInfo,
			occ = roomInfo.get('Occupants'),
			Status = this.lastUpdated,
			currentTime = new Date(),
			difference = new Date(currentTime - Status);


		if(!Status){
			console.log("No last Active yet");
		}

		display = difference.getMinutes()+"m "+difference.getSeconds()+"s";


		if(occ.length===1 && isMe(occ[0])){
			display = 'Ended';
		}
		else if(difference.getMinutes() < 10){
			display = "In Progress... "+display;
		}else{
			display = "Last message "+display+" ago";
		}

		if(this.statusEl){
			this.statusEl.update(display);
		}

	},


	updateCount: function(){
		if(this.countEl){ this.countEl.update(this.unread || ''); }
		this.fireEvent('count-updated');
	}


});
