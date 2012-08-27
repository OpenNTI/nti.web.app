Ext.define('NextThought.view.Main', {
	extend: 'Ext.container.Viewport',
	alias: 'widget.master-view',

	requires: [
//		'Ext.env.FeatureDetector',
		'Ext.layout.container.HBox',
		'Ext.layout.container.VBox',
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
		{xtype: 'main-sidebar', region: 'east'}
	],

	constructor: function(){
		this.hidden = Boolean(NextThought.phantomRender);
		return this.callParent(arguments);
	}

}, function(){
	//firefox doesn't report supporting: CSS3DTransform, so we'll omit it.
	var features = ['Canvas','Range','CSS3BoxShadow','CSS3BorderRadius'],f,
		unsupported = [],
		proto = this.prototype;

	while(!!(f = features.pop())){
		if(!Ext.supports[f]) {
			unsupported.push(f);
		}
	}

	//TODO: Make the IE9 message work without breaking
	if(unsupported.length!==0){
		proto.items.push(
			{
				region: 'north',
				id: 'browser-warning',
				cls: 'browser-warning',
				height: 50,
				html: 'Your browser is not supported, here is a list of <a href="https://docs.google.com/document/pub?id=1dUvxe-n1VBuGpFV5CrBrVeaGJ_hH4kzPRiaGN2cWxsg">browsers we support</a>.'
			}
		);
		unsupported.reverse();
		console.warn("Unsupported features: "+unsupported.join(', '));
	}

	if(Ext.getScrollbarSize(true).width > 2){
		Ext.getBody().addCls('detected-scrollbars');
	}
});
