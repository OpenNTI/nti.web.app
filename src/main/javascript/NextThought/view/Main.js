Ext.define('NextThought.view.Main', {
	extend: 'Ext.container.Viewport',
	alias: 'widget.master-view',

	requires: [
		'Ext.layout.container.Border',
		'Ext.layout.container.HBox',
		'Ext.layout.container.VBox',
		'NextThought.view.MessageBox',
		'NextThought.view.Navigation',
		'NextThought.view.SideBar',
		'NextThought.view.Views'
	],

	border: false,
	frame: false,
	defaults:{ border: false, frame: false },
	layout: 'border',
	id: 'viewport',
	ui: 'nextthought',
	minWidth: 1024,

	items:[
		{xtype: 'main-navigation', region: 'west'},
		{xtype: 'main-views', id: 'view-ctr', region: 'center'},
		{xtype: 'container', region: 'east', weight: 30, minWidth:260}
	],

	constructor: function(){
		this.hidden = Boolean(NextThought.phantomRender);
		this.callParent(arguments);
		return this;
	},

	afterRender: function(){
		this.callParent(arguments);


		Ext.EventManager.onWindowResize(this.detectZoom,this);
		this.detectZoom();
		Ext.widget('main-sidebar', {
			host: this.down('[region=east]'), hidden: this.hidden
		});
	},


	detectZoom: function(){
		var z = DetectZoom.zoom();
		console.log("Zoom:",z);

		if(z !== 1) {
			if(!this.el.isMasked()){
				Ext.getBody().addCls('dark');
				this.el.mask('Zoom levels are not supported, return your view to normal zoom','zoom');
			}
		}
		else if(this.el.isMasked()){
			Ext.getBody().removeCls('dark');
			this.el.unmask();
		}
	}
});
