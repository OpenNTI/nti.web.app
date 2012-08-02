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

	items: [
		' '
	],

	initComponent: function(){
		this.callParent(arguments);
		this.setHeight(Ext.Element.getViewportHeight());
		Ext.EventManager.onWindowResize(this.viewportMonitor,this);
	},

	destroy: function(){
		Ext.EventManager.removeResizeListener(this.viewportMonitor,this);
	},

	viewportMonitor: function(w,h){
		this.setHeight(h);
	},

	showBy: function(cmp){
		this.callParent([cmp,this.defaultAlign]);
	}

});
