const Ext = require('@nti/extjs');

require('internal/legacy/common/form/fields/ComboBox');
require('./ColorPickerButton');

module.exports = exports = Ext.define(
	'NextThought.app.whiteboard.editor.TextOptions',
	{
		alias: 'widget.wb-tool-text-options',
		extend: 'Ext.toolbar.Toolbar',
		ui: 'options',
		cls: 'text-options',
		layout: 'none',

		items: [
			{
				ui: 'font-size-select',
				xtype: 'nt-combobox',
				width: 70,

				store: '', //store defined in callback see below ---v
				queryMode: 'local',
				displayField: 'size',
				valueField: 'size',
				value: '12 pt',
			},
			{
				xtype: 'color-picker-button',
				value: '333333',
			},
			{
				ui: 'options',
				scale: 'medium',
				iconCls: 'bold',
				enableToggle: true,
			},
			{
				ui: 'options',
				scale: 'medium',
				iconCls: 'italic',
				enableToggle: true,
			},
			{
				ui: 'options',
				scale: 'medium',
				iconCls: 'underline',
				enableToggle: true,
			},
		],
	},
	function () {
		this.prototype.items[0].store = Ext.data.Store.create({
			fields: ['size'],
			data: [
				{ size: '12 pt' },
				{ size: '14 pt' },
				{ size: '18 pt' },
				{ size: '24 pt' },
				{ size: '30 pt' },
				{ size: '36 pt' },
				{ size: '48 pt' },
				{ size: '60 pt' },
			],
		});
	}
);
