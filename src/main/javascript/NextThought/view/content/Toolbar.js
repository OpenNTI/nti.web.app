Ext.define('NextThought.view.content.Toolbar',{
	extend: 'Ext.toolbar.Toolbar',
	requires: [
		'NextThought.view.content.Filter',
		'NextThought.view.content.JumpBox',
		'NextThought.view.content.Pager',
		'NextThought.view.content.Font',
		'NextThought.view.content.Settings'
	],
	alias: 'widget.content-toolbar',
	ui: 'content',


	height: 79,
	defaults: {
		xtype: 'tbspacer'
	},

	items: [
		{ width: 185 },
		{ xtype: 'content-filter', flex: 1 },
		{ xtype: 'content-jumper', flex: 1 },
		{ xtype: 'content-pager'},
		{ width:10 },
		{ xtype: 'content-font-chooser'},
		{ width:10 },
		{ xtype: 'content-settings'},
		{ width:290 }
	]
});
