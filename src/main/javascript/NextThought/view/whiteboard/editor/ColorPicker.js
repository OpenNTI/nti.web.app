Ext.define('NextThought.view.whiteboard.editor.ColorPicker',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.color-picker',
	requires: [
		'NextThought.view.whiteboard.editor.ColorPalette',
		'NextThought.view.whiteboard.editor.ColorOption'
	],

	ui: 'nt',
	cls: 'color-picker',
	plain: true,
	shadow: false,
	frame: false,
	border: false,
	defaultAlign: 't-b?',
	hideMode: 'display',

	items : [{xtype: 'color-palette'}]
});
