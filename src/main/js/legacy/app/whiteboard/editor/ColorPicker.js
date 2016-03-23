var Ext = require('extjs');
var EditorColorPalette = require('./ColorPalette');


module.exports = exports = Ext.define('NextThought.app.whiteboard.editor.ColorPicker', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.color-picker',
	ui: 'nt',
	cls: 'color-picker',
	plain: true,
	shadow: false,
	frame: false,
	border: false,
	showSeparator: false,
	defaultAlign: 't-b?',
	hideMode: 'display',
	items: [{xtype: 'color-palette'}],

	initComponent: function() {
		this.callParent(arguments);
		this.addEvents('select');
		this.relayEvents(this.down('color-palette'), ['select']);
	}
});
