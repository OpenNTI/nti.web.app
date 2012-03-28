Ext.define('NextThought.view.widgets.main.LeftColumn', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.leftColumn',
	requires: [
		'NextThought.util.Globals'
	],

	cls: 'x-column x-left-column',
	frame: false,
	border: false,
	defaults: {frame: false, border: false},

	layout:{
		type:'hbox',
		align: 'stretch'
	},

	dockedItems: {
		xtype: 'toolbar',
		cls: 'x-docked-noborder-top',
		items: [
			'->',
			{ showChat: true, tooltip: 'Chat', iconCls: 'chat' },
			{ objectExplorer: true, tooltip: 'My Stuff', iconCls: 'object-explorer' } ]
	},

	columnWidget: {'html':'assign the columnWidget property'},

	initComponent: function(){
		this.callParent(arguments);
		this.removeAll();//just in case someone tried to populate the items property
		this.add({flex: 1});
		this.add(this.columnWidget);
	}
});
