Ext.define('NextThought.view.widgets.ReaderItemsPanel', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.reader-items',
	requires: [
			'NextThought.view.widgets.PeopleList',
			'NextThought.view.widgets.RelatedItemsList',
			'NextThought.view.widgets.MiniStreamList'
			],
			
	width: MIN_SIDE_WIDTH,
	autoScroll: true,

	defaults: {
		margin: 'auto auto 15px auto'
	},

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
