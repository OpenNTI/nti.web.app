Ext.define('NextThought.view.whiteboard.editor.TextOptions',{
	alias: 'widget.wb-tool-text-options',
	extend: 'Ext.toolbar.Toolbar',
	requires: [
		'NextThought.view.form.fields.ComboBox',
		'NextThought.view.whiteboard.editor.ColorPickerButton'
	],
	ui: 'options',
	cls: 'text-options',

	items: [
		{
			ui: 'font-size-select',
			xtype: 'nt-combobox',
			width: 70,

			store: Ext.create('Ext.data.Store', {
				fields: ['size'],
				data : [
					{"size":"12 pt"},
					{"size":"14 pt"},
					{"size":"18 pt"},
					{"size":"24 pt"},
					{"size":"30 pt"},
					{"size":"36 pt"},
					{"size":"48 pt"},
					{"size":"60 pt"}
				]
			}),
			queryMode: 'local',
			displayField: 'size',
			valueField: 'size',
			value: '12 pt'
		},{
			xtype: 'color-picker-button',
			value: '333333'
		},{
			ui: 'options',
			scale: 'medium',
			iconCls: 'bold',
			enableToggle: true
		},{
			ui: 'options',
			scale: 'medium',
			iconCls: 'italic',
			enableToggle: true
		},{
			ui: 'options',
			scale: 'medium',
			iconCls: 'underline',
			enableToggle: true
		}
	]
});
