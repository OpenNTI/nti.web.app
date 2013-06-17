Ext.define('NextThought.view.Navigation',{
	extend: 'Ext.container.Container',
	alias: 'widget.main-navigation',
	requires: [
		'NextThought.view.ViewSelect'
	],

	cls: 'main-navigation',
	layout: {
		type: 'vbox',
		pack: 'start'
	},
	width: 69,

	items: [
		{ xtype: 'view-select' }
	]
});
