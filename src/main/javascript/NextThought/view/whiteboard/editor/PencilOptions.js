Ext.define('NextThought.view.whiteboard.editor.PencilOptions',{
	alias: 'widget.wb-tool-pencil-options',
	extend: 'Ext.container.Container',
	requires: [
		'NextThought.view.whiteboard.editor.ColorOption',
		'NextThought.view.whiteboard.editor.ToolOption'
	],

	ui: 'options',
	layout: {
		type:'hbox',
		align: 'stretchmax'
	},
	items: [{
		xtype: 'toolbar',
		ui: 'options',
		cls: 'pencil-stroke-options',
		defaults: {
			xtype: 'wb-tool-option',
			toggleGroup: 'pencil-stroke-'+guidGenerator()
		},
		items: [
			{ option: 'fine stroke', pressed: true },
			{ option: 'small stroke' },
			{ option: 'medium stroke' },
			{ option: 'large stroke' }
		]
	},{
		//Fill color is always transparent (aka none) and this color selection is only stroke color
		xtype: 'toolbar',
		ui: 'options',
		cls: 'pencil-color-options',
		defaults: {
			ui: 'option',
			scale: 'large',
			cls: 'color',
			xtype: 'wb-color-option',
			toggleGroup: 'pencil-color-'+guidGenerator()
		},
		items: [
			{ color: 'black', pressed: true },
			{ color: 'grey1' },
			{ color: 'grey2' },
			{ color: 'grey3' },
			{ color: 'red' },
			{ color: 'blue' },
			{ color: 'green' },
			{ color: 'orange' },
			{ color: 'magenta' },
			{ color: 'purple' },
			{ color: 'yellow' }
		]
	}]
});
