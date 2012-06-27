Ext.define('NextThought.view.whiteboard.editor.ShapeOptions',{
	alias: 'widget.wb-tool-shape-options',
	extend: 'Ext.container.Container',
	requires: [
		'NextThought.view.whiteboard.editor.ColorPickerButton',
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
		cls: 'shape-options',
		defaults: {
			xtype: 'wb-tool-option',
			toggleGroup: 'shape-selected-'+guidGenerator()
		},
		items: [
			{ option: 'line shape', pressed: true },
			{ option: 'square shape' },
			{ option: 'circle shape' },
			{ option: 'triangle shape' },
			{ option: 'poly shape', options: [5,6,7,8,9,10,11,12] }
		]
	},{
		xtype: 'toolbar',
		ui: 'options',
		cls: 'shape-color-options',
		defaults: {
			ui: 'option',
			scale: 'large'
		},
		items: [
			'Fill',
			{xtype: 'color-picker-button'},
			'Stroke',
			{
				ui: 'stroke-size-select',
				xtype: 'nt-combobox',
				width: 85,

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
			},
			{xtype: 'color-picker-button'}
		]
	}],


	getToolType: function() {
		return 'pencil';
	},


	setOptions: function(options) {
		if(options.stroke){
			this.down('[stroke='+options.stroke+']').toggle(true);
		}
		if (options.strokeWidth) {
			this.down('[strokeWidth='+options.strokeWidth+']').toggle(true);
		}
		if(options.fill) {
			console.error('fill is not supported for pencil');
		}
	},


	getOptions: function(){
		var pressed = this.query('button[pressed]'),
			stroke, strokeWidth;

		Ext.each(pressed, function(b){
			if (b.strokeWidth){
				strokeWidth = b.strokeWidth
			}
			else if (b.stroke) {
				stroke = b.stroke
			}
		});

		return {
			fill: null, //TODO - not implemented in design
			stroke:	stroke,
			strokeWidth: strokeWidth
		};
	}
});
