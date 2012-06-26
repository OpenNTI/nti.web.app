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
			{ color: 'black', stroke: '#333333' },
			{ color: 'grey1', stroke: '#707070' },
			{ color: 'grey2', stroke: '#acacac' },
			{ color: 'grey3', stroke: '#e1e1e1' },
			{ color: 'red', stroke: '#d34f39' },
			{ color: 'blue', stroke: '#2b89c5' },
			{ color: 'green', stroke: '#a0c94c' },
			{ color: 'orange', stroke: '#fa8700' },
			{ color: 'magenta', stroke: '#b42789' },
			{ color: 'purple', stroke: '#6f3d93' },
			{ color: 'yellow', stroke: '#fff02a' }
		]
	}]
});
