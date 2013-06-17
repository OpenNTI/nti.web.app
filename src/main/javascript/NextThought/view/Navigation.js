Ext.define('NextThought.view.Navigation',{
	extend: 'Ext.container.Container',
	alias: 'widget.main-navigation',
	requires: [
		'NextThought.view.ViewSelect'
	],

	cls: 'main-navigation',
	layout: 'auto',

	items: [
		{ xtype: 'view-select' }
	]
});
