Ext.Loader.setPath('Ext.env', Ext.Loader.getPath('Ext')+'/core/src/env');

Ext.define('NextThought.view.Viewport', {
	extend: 'Ext.container.Viewport',
	alias: 'widget.master-view',

	requires: [
		'Ext.env.FeatureDetector',
		'Ext.layout.container.Border',
		'Ext.layout.container.VBox',
		'NextThought.view.widgets.main.Header',
		'NextThought.view.modes.Container'
	],
	
	border: false, 
	frame: false,
	defaults:{ border: false, frame: false },
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	id: 'viewport',

	items:[
		{xtype: 'master-header', region: 'north'},
		{xtype: 'panel', id: 'browser-warning', cls: 'browser-warning', html: 'Your browser is not supported, here is a list of <a href="https://docs.google.com/document/pub?id=1dUvxe-n1VBuGpFV5CrBrVeaGJ_hH4kzPRiaGN2cWxsg">browsers we support</a>.'},
		{xtype: 'modeContainer', region: 'center', id: 'mode-ctr', flex: 1}
	],


	constructor: function(){
		this.hidden = Boolean(NextThought.phantomRender);
		this.callParent(arguments);
	},


	getActive: function(){
		console.trace('stop it');
		if(!this.container) {
			this.container = this.down('modeContainer');
		}
		return this.container.getActive();
	}
}, function(){
	//'CSSTransitions','CSSAnimations',
	var features = ['Canvas','CSSTransforms','SVG','Video'],f,
		unsupported = [];


	while(!!(f = features.pop())){
		if(!Ext.features.has(f)) {
			unsupported.push(f);
		}
	}

	if(unsupported.length===0){
		Ext.Array.erase(this.prototype.items, 1,1);
	}
	else {
		unsupported.reverse();
		console.warn("Unsupported features: "+unsupported.join(', '));
	}
});
