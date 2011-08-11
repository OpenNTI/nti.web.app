
Ext.define('NextThought.view.widgets.FilterControlPanel', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.filter-control',

	width: MIN_SIDE_WIDTH,

	initComponent: function(){
   		this.callParent(arguments);
   		this.setWidth(MIN_SIDE_WIDTH);
	}
});