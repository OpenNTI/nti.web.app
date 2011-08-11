
Ext.define('NextThought.view.widgets.RightColumn', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.rightColumn',
	
	cls: 'x-column x-right-column',
	frame: false,
	border: false,
	defaults: {frame: false, border: false, padding: 5},
	
	width: MIN_SIDE_WIDTH,
	
    layout: 'hbox',

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