Ext.define('NextThought.view.widgets.ReaderItemsPanel', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.reader-items',
	requires: [
			'NextThought.proxy.UserDataLoader',
			'NextThought.view.widgets.PeopleList',
			'NextThought.view.widgets.RelatedItemsList',
			'NextThought.view.widgets.MiniStreamList'
			],
			
	width: MIN_SIDE_WIDTH,
	
	items: [
		{xtype: 'people-list'},
		{xtype: 'related-items'},
		{xtype: 'mini-stream'}
		
	],
		
	constructor: function(){
		this.callParent(arguments);
		return this;
	},
	
	initComponent: function(){
		this.callParent(arguments);
	}
});