Ext.define('NextThought.view.widgets.ReaderItemsPanel', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.reader-items',
	requires: [
		'NextThought.util.Globals',
		'NextThought.view.widgets.PeopleList',
		'NextThought.view.widgets.RelatedItemsList',
		'NextThought.view.widgets.MiniStreamList'
	],
			
	autoScroll: true,
	border: false,

	defaults: {
		margin: 'auto auto 15px 5px'
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
