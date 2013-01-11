Ext.define('NextThought.view.content.Toolbar',{
	extend: 'Ext.toolbar.Toolbar',
	requires: [
		'NextThought.view.content.Filter',
		'NextThought.view.content.Navigation',
		'NextThought.view.content.Pager',
		'NextThought.view.content.Font',
		'NextThought.view.content.Settings',
		'Ext.toolbar.Spacer'
	],
	alias: 'widget.content-toolbar',
	ui: 'content',


	height: 75,
	defaults: {
		xtype: 'tbspacer'
	},

	items: [
		{ xtype: 'content-filter', flex: 1 },
		{ width: 80 },
		{ xtype: 'content-navigation' },
		{ xtype: 'content-pager', width: 80}
	]
});
