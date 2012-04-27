Ext.define('NextThought.view.content.Toolbar',{
	extend: 'Ext.toolbar.Toolbar',
	requires: [
		'NextThought.view.content.Filter'
	],
	alias: 'widget.content-toolbar',
	ui: 'content',


	height: 79,

	items: [
//		'->',
		{ xtype: 'content-filter'}
	]
});
