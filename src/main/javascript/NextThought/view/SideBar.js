Ext.define('NextThought.view.SideBar',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.main-sidebar',

	requires: [
		'NextThought.view.SideBarTabPanel',
        'NextThought.view.account.activity.View',
		'NextThought.view.account.contacts.DisabledView',
		'NextThought.view.account.contacts.View',
        'NextThought.view.account.history.View',
		'NextThought.view.account.Identity'
	],

	width: 260,
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
	preventBringToFront: true,
	ui: 'sidebar',
	cls: 'sidebar',

	constructor: function(){
		var contactsType = 'disabled-contacts-view';

		if($AppConfig.service.canFriend()){
			contactsType = 'contacts-view';
		}

		this.items = [
			{ xtype: 'box', cls: 'gripper', autoEl: { html: 'My Account&nbsp;', cn:[
		            {tag: 'img', src:Ext.BLANK_IMAGE_URL,cls:'tool minimize' },
					{tag: 'img', src:Ext.BLANK_IMAGE_URL,cls:'tool maximize' }
		        ]}
			},
			{ xtype: 'sidebar-tabpanel',
				flex: 1,
				stateId: 'sidebar',
				items: [
					{ xtype: contactsType },
					{ xtype: 'activity-view' },
					{ xtype: 'history-view' }
//						{ iconCls: 'inbox', title: 'inbox' }
				]
			}];

		return this.callParent(arguments);
	},


	initComponent: function(){
		this.callParent(arguments);
		this.gripper = this.down('[cls=gripper]');
		this.mon(this.host,'afterlayout', this.syncUp, this);
		Ext.EventManager.onWindowResize(this.viewportMonitor,this,null);

		this.on('activate',function(){
			Ext.WindowManager.sendToBack(this);
		},this);
	},


	destroy: function(){
		Ext.EventManager.removeResizeListener(this.viewportMonitor,this);
		this.toggle.remove();
	},


	viewportMonitor: function(w){
		var cls = 'undocked';
		if (w < 1278) {
			this.host.hide();
			this.gripper.show();
			this.addCls(cls);
		}
		else{
            this.stopAnimation();
			this.setPopState(undefined);
			this.gripper.hide();
			this.host.show();
			this.removeCls(cls);
		}
        Ext.defer(this.syncUp, 1, this);
	},


	afterRender: function(){
		this.callParent(arguments);

		this.identity = Ext.widget('identity',{renderTo:this.el});

		this.viewportMonitor(Ext.Element.getViewportWidth());

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

		this.mon(this.gripper.el,'click',this.togglePopup,this);
	},


	syncUp: function(){

		var h = Ext.Element.getViewportHeight(),
			x = Ext.Element.getViewportWidth()-this.getWidth(),
			y = 0,
			size = this.host.getSize(),
			animate = false,
			up = 100,
			down = h - this.gripper.getHeight();

		clearTimeout(this.syncHeight);
		if(!this.host.isVisible()){
			animate = true;
			size = {height: h-up};
			y = (this.getPopState()? up:down)+1;
			x -= 10;
			if(!this.getPopState()){
				this.syncHeight = Ext.defer(this.setHeight,1000,this,[27]);
			}
		}

		this.setHeight(size.height);
		this.fireEvent('beforemove',animate);
		this.setPagePosition(x,y,animate);
	},


	togglePopup: function(evt, dom){
        var target = evt.getTarget(),
            down = Ext.fly(target).hasCls('minimize') ? true : false,
			pop = this.getPopState();

        if ( (down && pop) || (!down && !pop) ) {
            this.setPopState(!pop);
            this.syncUp();
        }
	},



	getPopState: function(){
		var sidebar = Ext.JSON.decode(sessionStorage.getItem('sidebar')||'{}'),
		    pop = sidebar.hasOwnProperty('popstate')? sidebar.popstate : true;

		if(!this.hasOwnProperty('popstate')){
			this.popstate = pop;
		}

		return this.popstate;
	},


	setPopState: function(state){
		var sidebar = Ext.JSON.decode(sessionStorage.getItem('sidebar')||'{}');
		if(typeof state !== 'boolean') {
			delete this.popstate;
			delete sidebar.popstate;
		}
		else { sidebar.popstate = this.popstate = state; }

		sessionStorage.setItem('sidebar',Ext.JSON.encode(sidebar));
	}
});
