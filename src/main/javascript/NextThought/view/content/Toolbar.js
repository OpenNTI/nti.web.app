Ext.define('NextThought.view.content.Toolbar',{
	extend: 'Ext.toolbar.Toolbar',
	requires: [
		'NextThought.view.content.Filter',
		'NextThought.view.content.JumpBox'
	],
	alias: 'widget.content-toolbar',
	ui: 'content',


	height: 79,

	items: [
		' ',
		{ xtype: 'content-filter'},
		' ',
		{ xtype: 'content-jumper'}
	]
});
