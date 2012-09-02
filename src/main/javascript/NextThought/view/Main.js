Ext.define('NextThought.view.Main', {
	extend: 'Ext.container.Viewport',
	alias: 'widget.master-view',

	requires: [
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
		Ext.widget({xtype: 'main-sidebar', host: this.down('[region=east]')});
		return this;
	}

}, function(){
	var unsupported = [];
	Ext.each(//firefox doesn't report supporting: CSS3DTransform, so we'll omit it.
			['Canvas','Range','CSS3BoxShadow','CSS3BorderRadius'],
		function(f){ Boolean(!Ext.supports[f] && unsupported.push(f)); });

	if(unsupported.length!==0 || Ext.isOpera){
		location.replace('notsupported.html');
		console.warn("Unsupported features: "+unsupported.join(', '));
	}

	if(Ext.getScrollbarSize(true).width > 2){
		Ext.getBody().addCls('detected-scrollbars');
	}
});
