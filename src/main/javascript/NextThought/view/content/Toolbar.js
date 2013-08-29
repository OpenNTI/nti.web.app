Ext.define('NextThought.view.content.Toolbar', {
	extend:   'Ext.container.Container',
	requires: [
		'NextThought.view.content.Navigation',
		'NextThought.view.content.Pager'
	],
	alias:    'widget.content-toolbar',
	ui:       'content',
	cls:      'content-toolbar',


	height: 60,

	layout: {
		type: 'hbox'
	},

	items: [
		{ xtype: 'content-navigation', delegate: 'inherit', flex: 1 },
		{ xtype: 'content-pager', delegate: 'inherit'}
	]
});
