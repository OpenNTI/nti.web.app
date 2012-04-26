

Ext.define( 'NextThought.view.modes.Container', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.modeContainer',
	requires: [
		'Ext.layout.container.Card',
		'NextThought.view.modes.Home',
		'NextThought.view.modes.Reader',
		'NextThought.view.modes.Stream',
		'NextThought.view.modes.Groups',
		'NextThought.view.modes.Classroom'
	],
	
	// plain: true,
	border: false, 
	frame: false,
	layout: {
		type: 'card',
		deferredRender: true
	},
	activeItem: 0,
	items:[
		{id: 'home',   xtype: 'home-mode-container'},
		{id: 'library', xtype: 'reader-mode-container'},
		{id: 'classroom', xtype: 'classroom-mode-container'}
	],
	
	getActive: function() {
		return this.getLayout().getActiveItem();
	}
});
