const Ext = require('@nti/extjs');

module.exports = exports = Ext.define(
	'NextThought.app.whiteboard.editor.ColorOption',
	{
		alias: 'widget.wb-color-option',
		extend: 'Ext.button.Button',

		enableToggle: true,
		allowDepress: false,
		toggleGroup: 'whitebard-color-option',

		scale: 'large',
		ui: 'button',
		baseCls: 'whiteboard-color',

		initComponent: function () {
			this.addCls(this.color);
			this.iconCls = this.color;
			this.tooltip = Ext.String.capitalize(this.color);
			this.callParent(arguments);
		},
	}
);
