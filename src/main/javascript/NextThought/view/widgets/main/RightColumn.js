
Ext.define('NextThought.view.widgets.main.RightColumn', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.rightColumn',
	requires: [
		'NextThought.util.Globals'
	],

	cls: 'x-column x-right-column',
	frame: false,
	border: false,
	defaults: {frame: false, border: false},

	layout:{
		type:'hbox',
		align: 'stretch'
	},

	columnWidget: {'html':'assign the columnWidget property'},

	dockedItems: {
		xtype: 'toolbar',
		cls: 'x-docked-noborder-top',
		items: ['Community','->', {text: '&nbsp;',focusable: false, disabled:true}]
	},

	initComponent: function(){
		this.callParent(arguments);
		this.removeAll();//just in case someone tried to populate the items property
		this.add(this.columnWidget);
		this.add({flex: 1});
	}
});
