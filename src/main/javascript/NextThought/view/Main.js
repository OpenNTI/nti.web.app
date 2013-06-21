Ext.define('NextThought.view.Main', {
	extend: 'Ext.container.Viewport',
	alias: 'widget.master-view',

	requires: [
		'Ext.layout.container.Absolute',
		'Ext.layout.container.Border',
		'Ext.layout.container.HBox',
		'Ext.layout.container.VBox',
		'NextThought.view.MessageBox',
		'NextThought.view.Navigation',
		'NextThought.view.SideBar',
		'NextThought.view.Views',
		'NextThought.view.MessageBar'
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

		var map = {
			width: 'right',
			height: 'bottom',
			widthp: 'left',
			heightp: 'top'
		};

		Ext.Object.each(Ext.getScrollbarSize(),function(k,v){
			if(v){ Ext.getBody().addCls('detected-scrollbars');

				var style = document.createElement('style');
				style.type = 'text/css';
				style.innerHTML = [
					'.scroll-pos-'+map[k]+' { '+map[k+'p']+':-'+v+'px !important; } ',
					'.scroll-margin-'+map[k]+' { margin-'+map[k]+':'+v+'px !important; } ',
					'.scroll-padding-'+map[k]+' { padding-'+map[k]+':'+v+'px !important; } '
				].join(' \r\n ');

				document.getElementsByTagName('head')[0].appendChild(style);

			}
		});

		Ext.EventManager.onWindowResize(this.detectZoom,this);
		this.detectZoom();
		this.navbar = this.down('main-navigation');
		this.views = this.down('main-views');
		this.sidebar = Ext.widget('main-sidebar', {
			host: this.down('[region=east]'), hidden: this.hidden
		});

        Ext.getDoc().on('touchmove', function(e) {
            e.preventDefault();
        });
	},


	activateView: function(id){
		return this.views.fireEvent('activate-main-view', id);
	},


	detectZoom: function(){
		var z = DetectZoom.zoom(),
			currentBar;
		console.log("Zoom:",z);

		//IEs returns jacked up coordinates when zoom is applied.  Scold if they are in
		//IE and a zoom level other than 1
		if(Ext.isIE){
			if(z!==1){
				Ext.widget('message-bar', {
					renderTo: Ext.getBody(),
					messageType: 'zoom',
					message: 'Your browser\'s current zoom setting is not fully supported. Please reset it to the default zoom.'
				});
			}
			else{
				currentBar = Ext.ComponentQuery.query('message-bar');
				if(!Ext.isEmpty(currentBar)){
					currentBar[0].destroy();
				}
			}
		}
	}
});
