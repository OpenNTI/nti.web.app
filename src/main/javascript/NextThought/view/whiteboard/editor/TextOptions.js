Ext.define('NextThought.view.whiteboard.editor.TextOptions',{
	alias: 'widget.wb-tool-text-options',
	extend: 'Ext.toolbar.Toolbar',
	requires: [
		'NextThought.view.form.fields.ComboBox',
		'NextThought.view.whiteboard.editor.ColorPicker'
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
			valueField: 'size'
		},{
			scale: 'large',
			cls: 'color',
			ui: 'button',
			baseCls: 'whiteboard-color',
			menuAlign: 't-b?',
			menu: {xtype: 'color-picker'}
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
