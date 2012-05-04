Ext.Loader.setPath('Ext.env', Ext.Loader.getPath('Ext')+'/core/src/env');

Ext.define('NextThought.view.Viewport', {
	extend: 'Ext.container.Viewport',
	alias: 'widget.master-view',

	requires: [
		'Ext.env.FeatureDetector',
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
	//'CSSTransitions','CSSAnimations',
	var features = ['Canvas','CSSTransforms','SVG','Video'],f,
		unsupported = [],
		proto = this.prototype;

	while(!!(f = features.pop())){
		if(!Ext.features.has(f)) {
			unsupported.push(f);
		}
	}

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

	var v = Ext.getScrollBarWidth(true);
	if(v > 2){
		Ext.getBody().addCls('detected-scrollbars');
	}
});
