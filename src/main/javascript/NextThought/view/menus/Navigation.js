Ext.define('NextThought.view.menus.Navigation',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.navigation-menu',

	ui: 'navigation-menu',

	defaultAlign: 'r-l?',

	layout: 'auto',
	overflowX: 'hidden',
	overflowY: 'scroll',

	ignoreParentClicks: true,
	plain: true,
	showSeparator: false,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'display',
	width: 290,

	initComponent: function(){
		this.callParent(arguments);
		this.setHeight(Ext.Element.getViewportHeight());
		Ext.EventManager.onWindowResize(this.viewportMonitor,this);

		//set up other handlers for closing:
		this.mon(this, {
			scope: this,
			mouseleave: this.startHide,
			mouseenter: this.stopHide
		});
	},

	startHide: function(){
		var me = this;
		me.stopHide();
		me.leaveTimer = setTimeout(function(){me.hide();}, 500);
	},


	stopHide: function(){ clearTimeout(this.leaveTimer); },

	destroy: function(){
		Ext.EventManager.removeResizeListener(this.viewportMonitor,this);
	},

	viewportMonitor: function(w,h){
		this.setHeight(h);
	},

	showBy: function(cmp){
		this.callParent([cmp,this.defaultAlign]);
	},

	//override this so as not to mess up scrolling that menus do by default.
	setActiveItem: Ext.emptyFn

});
