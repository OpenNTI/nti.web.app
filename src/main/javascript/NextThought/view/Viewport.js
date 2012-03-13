
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
		{xtype: 'panel', id: 'browser-warning', cls: 'browser-warning', html: 'Your browser is unsupported at this time. See a list of supported browsers <a href="supported.html">here</a>'},
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
	if(	!Ext.features.has('SVG')		||
		!Ext.features.has('Canvas')		||
		!Ext.features.has('History')	||
		!Ext.features.has('Video')		||
		!Ext.features.has('CSSTransforms')		||
		!Ext.features.has('CSSTransitions')		||
		!Ext.features.has('CSSAnimations')) {
		return;
	}

	Ext.Array.erase(this.prototype.items, 1,1);
});
