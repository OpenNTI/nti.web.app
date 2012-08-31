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
			mouseenter: this.cancelDeferHide
		});
	},

	startHide: function(menu, event){
		var box = menu.getBox();
		//If the X coordinate of this "mouseleave" event is less than our RIGHT side, we left the box on the
		// left. (and we don't want to close the menu in that case)
		if(event.getXY()[0] < (box.x+box.width)){return;}

		this.cancelDeferHide();
		this.leaveTimer = Ext.defer(this.hide,500,this);
	},

//menu's call this on mouseover to their parent menuitems...so we named it to match.
	cancelDeferHide: function(){ clearTimeout(this.leaveTimer); },

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
