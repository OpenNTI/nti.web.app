Ext.define('NextThought.view.content.Font',{
	extend : 'Ext.container.Container',
	alias: 'widget.content-font-chooser',
	ui: 'content-font',

	layout: {
		type: 'hbox'
	},

	defaults: {
		xtype: 'button',
		ui: 'content-button',
		iconCls: 'font',
		scale: 'large',
		handler: function(btn){  }
	},

	items: [{cls: 'font'}]
});
