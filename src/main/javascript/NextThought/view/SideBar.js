Ext.define('NextThought.view.SideBar',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.main-sidebar',

	requires: [
		'NextThought.view.account.activity.View',
		'NextThought.view.account.activity.ViewNew',
		'NextThought.view.account.contacts.DisabledView',
		'NextThought.view.account.contacts.View',
		'NextThought.view.account.history.View',
		'NextThought.view.chat.Dock'
	],

	width: 260,
	height: 100,
	layout: {
		type:'vbox',
		align: 'stretch'
	},
	floating: true,
	autoShow: true,
	constrain: false,
	frame: false,
	plain: true,
	shadow: false,
	ui: 'sidebar',
	cls: 'sidebar',

	preventBringToFront:true,
	listeners: {
		activate: function(){
			Ext.WindowManager.sendToBack(this);
		}
	},

	constructor: function(){
		var contactsType = 'disabled-contacts-view',
			history = !isFeature('remove-history-tab');

		if($AppConfig.service.canFriend()){
			contactsType = 'contacts-view';
		}

		this.items = [
			{
				xtype: 'container',
				layout: 'border',
				flex: 1,
				items: [
					{ xtype: 'sidebar-tabpanel',
						region: 'center',
						stateId: 'sidebar',
						items: [
							{ xtype: contactsType },
							{ xtype: 'activity-view' + (history? '':'-new') },
							{ xtype: 'history-view' }
						].slice(0, history?undefined:-1)
					},
					{ xtype: 'chat-dock', region: 'south'}
				]
			}
		];

		this.callParent(arguments);
	},


	initComponent: function(){
		this.callParent(arguments);
		this.mon(this.host,'afterlayout', this.syncUp, this);
		Ext.EventManager.onWindowResize(this.viewportMonitor,this,null);

		var contactsView = this.down('contacts-view'),
			relayer;

		if(contactsView){
			relayer = contactsView.relayEvents(this.down('chat-dock'),['update-count'],'chat-dock-');
			contactsView.on('destroy','destroy',relayer);
		}
	},


	destroy: function(){
		Ext.EventManager.removeResizeListener(this.viewportMonitor,this);
		this.toggle.remove();
	},


	viewportMonitor: function(w){
		if (w < 1278) {
			this.host.hide();
		}
		else{
			this.stopAnimation();
			this.host.show();
		}
		Ext.defer(this.syncUp, 1, this);
	},


	afterRender: function(){
		this.callParent(arguments);

		this.viewportMonitor(Ext.Element.getViewportWidth());

		this.mon(this.el,{
			mouseenter:'startShow',
			mouseleave:'startHide'
		});

		this.mon(Ext.getBody(),{
			mouseover: 'maybeCancelHide'
		});


		/**
		 * There floating point animation is causing some jitters as the side bar is animated up & down.
		 * This replacement implementation works by making function return what is passed, (whole integers) so no
		 * fractional number jitters can occur.  AND, we only want to do this with THIS element, not all elements.
		 *
		 * @see {Ext.dom.Element#translateXY}
		 *
		 * @param x {Number/Number[]}
		 * @param y {Number}
		 * @returns {{x: Number, y: Number}}
		 */
		this.el.translateXY = function(x,y){
			if(Ext.isArray(x)){
				y = x[1];
				x = x[0];
			}
			return {
				x: x,
				y: y
			};
		};

		if(!$AppConfig.service.canChat()){
			this.down('chat-dock').destroy();
		}
	},


	maybeCancelHide: function(e){
		var l = e.getTarget('.x-layer'),
			m = e.getTarget('.x-mask');
		if(l || m){
			this.stopHide();
			return;
		}

		this.startHide();

	},


	stopShow: function(){
		clearTimeout(this.showTimeout);
		delete this.showTimeout;
	},


	stopHide: function(){
		clearTimeout(this.hideTimeout);
		delete this.hideTimeout;
	},


	startHide: function(force){
		if(this.host.isVisible()){return;}

		if(!this.hideTimeout || force){
			this.stopShow();
			this.hideTimeout = Ext.defer(this.syncUp, 500, this);
		}
	},

	startShow: function(force){
		if(this.host.isVisible()){return;}

		if(!this.showTimeout || force){
			this.stopHide();
			this.showTimeout = Ext.defer(this.rollDown, 500, this);
		}
	},


	rollDown: function(){
		var d = this.down('chat-dock');
		if(d){ d.show(); }
		this.setHeight(Ext.Element.getViewportHeight()-10);
		this.addCls('down');
		this.stopShow();
		this.stopHide();
	},


	syncUp: function(){
		var x = Ext.Element.getViewportWidth()-this.getWidth(),
			d = this.down('chat-dock'),
			size = this.host.getSize();

		if(!this.host.isVisible()){
			if(d){ d.hide(); }
			this.removeCls('down');
			size = {height: 57};
		}
		else {
			this.addCls('down');
			if(d){ d.show(); }
		}

		this.setHeight(size.height);
		this.fireEvent('beforemove',false);
		this.setPagePosition(x,0,false);

		this.stopHide();
	}
});



Ext.define('NextThought.view.SideBarTab',{
	extend: 'Ext.tab.Tab',
	alias: 'widget.sidebar-tab',
	mixins: {
		isListening: 'NextThought.mixins.IsListening'
	},
	plain: true,
	ui: 'sidebar'
});


Ext.define('NextThought.view.SideBarTabPanel',{
	extend: 'Ext.tab.Panel',
	requires: [
		'NextThought.mixins.IsListening',
		'Ext.layout.container.boxOverflow.None'
	],
	alias: 'widget.sidebar-tabpanel',
	ui: 'sidebar',
	plain: true,
	cls: 'sidebar-panel-container',
	stateful: true,
	stateEvents:['tabchange'],
	tabBar: {
		baseCls: 'sidebar-tab-bar',
		plain: true,
		ui: 'sidebar',
		xhooks: {
			initComponent: function(){
				this.callParent(arguments);
				this.layout.overflowHandler =
					new Ext.layout.container.boxOverflow.None(this.layout,{});
				this.layout.overflowHandler.scrollToItem = Ext.emptyFn;
			}
		}
	},

	onAdd: function(item, index){
		item.tabConfig = Ext.applyIf(item.tabConfig||{},{
			xtype: 'sidebar-tab'
		});
		return this.callParent([item,index]);
	},

	applyState: function(state){
		var t = (state||{}).t||0;

		this.setActiveTab(t);
	},

	getState: function(){
		return {t:this.items.indexOf(this.getActiveTab())};
	}
});
