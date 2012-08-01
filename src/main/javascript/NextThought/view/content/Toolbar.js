Ext.define('NextThought.view.content.Toolbar',{
	extend: 'Ext.toolbar.Toolbar',
	requires: [
		'NextThought.view.content.Filter',
		'NextThought.view.content.Navigation',
		'NextThought.view.content.Pager',
		'NextThought.view.content.Font',
		'NextThought.view.content.Settings'
	],
	alias: 'widget.content-toolbar',
	ui: 'content',


	height: 85,
	defaults: {
		xtype: 'tbspacer'
	},

	items: [
		{ xtype: 'content-filter', flex: 1 },
		{ width: 80 },
		{ xtype: 'content-navigation', width: 620 },
		{ xtype: 'content-pager', width: 80}
	]
});
