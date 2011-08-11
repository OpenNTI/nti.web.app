
Ext.define('NextThought.view.widgets.LeftColumn', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.leftColumn',
	
	cls: 'x-column x-left-column',
	frame: false,
	border: false,
	defaults: {frame: false, border: false, padding: 5},
	
	width: MIN_SIDE_WIDTH,
    		
    layout: 'hbox',
    
    dockedItems: {
		xtype: 'toolbar',
		cls: 'x-docked-noborder-top',
		items: [ '->',{ text: '&pi;' } ]
	},

	columnWidget: {'html':'assign the columnWidget property'},
	
    initComponent: function(){
   		this.callParent(arguments);
   		this.removeAll();//just in case someone tried to populate the items property
   		this.add({flex: 1});
   		this.add(this.columnWidget);
   	}
});