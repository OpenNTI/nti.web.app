Ext.define('NextThought.view.whiteboard.editor.ColorPicker',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.color-picker',
	requires: [
		'NextThought.view.whiteboard.editor.ColorPalette'
	],

	ui: 'nt',
	cls: 'color-picker',
	plain: true,
	shadow: false,
	frame: false,
	border: false,
	showSeparator: false,
	defaultAlign: 't-b?',
	hideMode: 'display',

	items : [{xtype: 'color-palette'}],

	initComponent: function(){
		this.callParent(arguments);
		this.addEvents('select');
		this.relayEvents(this.down('color-palette'), ['select']);
	}
});
