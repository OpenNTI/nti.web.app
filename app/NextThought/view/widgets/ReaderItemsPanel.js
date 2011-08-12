Ext.define('NextThought.view.widgets.ReaderItemsPanel', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.reader-items',
	requires: [
			'NextThought.proxy.UserDataLoader',
			'NextThought.view.widgets.PeopleList'
			],
			
	width: MIN_SIDE_WIDTH,
	
	items: [
		{xtype: 'people-list'}
	],
		
	constructor: function(){
		this.callParent(arguments);
		return this;
	},
	
	initComponent: function(){
		this.callParent(arguments);
	}
});