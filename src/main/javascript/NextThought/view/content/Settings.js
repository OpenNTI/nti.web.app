Ext.define('NextThought.view.content.Settings',{
	extend : 'Ext.container.Container',
	alias: 'widget.content-settings',
	ui: 'content-settings',

	layout: {
		type: 'hbox'
	},

	defaults: {
		xtype: 'button',
		ui: 'content-button',
		iconCls: 'settings',
		scale: 'large',
		handler: function(btn){  }
	},

	items: [{cls: 'settings'}]
});
