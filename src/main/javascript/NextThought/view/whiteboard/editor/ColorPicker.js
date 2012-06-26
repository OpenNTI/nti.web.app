Ext.define('NextThought.view.whiteboard.editor.ColorPicker',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.color-picker',
	requires: [
		'NextThought.view.whiteboard.editor.ColorOption'
	],

	ui: 'nt',
	cls: 's',
	plain: true,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'display',

	items : [{
		xtype: 'container',
		defaults: {
			xtype: 'wb-color-option'
		},
		items: [
			{color: 'black'},
			{color: 'grey1'},
			{color: 'grey2'},
			{color: 'grey3'}
		]
	}]
});
