
Ext.define('NextThought.view.Viewport', {
	extend: 'Ext.container.Viewport',
	alias: 'widget.master-view',

	requires: [
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
});
