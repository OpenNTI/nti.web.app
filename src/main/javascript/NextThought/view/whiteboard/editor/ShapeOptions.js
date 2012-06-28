Ext.define('NextThought.view.whiteboard.editor.ShapeOptions',{
	alias: 'widget.wb-tool-shape-options',
	extend: 'Ext.container.Container',
	requires: [
		'NextThought.view.whiteboard.editor.ColorPickerButton',
		'NextThought.view.whiteboard.editor.StrokeWidthSelector',
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
		cls: 'shape-picker',
		defaults: {
			xtype: 'wb-tool-option',
			toggleGroup: 'shape-selected-'+guidGenerator()
		},
		items: [
			{ option: 'line shape', sides: 1, pressed: true },
			{ option: 'square shape', sides: 4},
			{ option: 'circle shape' },
			{ option: 'triangle shape', sides: 3 },
			{ option: 'poly shape', options: [5,6,7,8,9,10,11,12] }
		]
	},{
		xtype: 'toolbar',
		ui: 'options',
		cls: 'shape-options',
		defaults: {
			ui: 'option',
			scale: 'large'
		},
		items: [
			'Fill',
			{ xtype: 'color-picker-button', fillSelect: true, value: '333333' },
			'Stroke',
			{ xtype: 'stroke-select' },
			{ xtype: 'color-picker-button', strokeSelect: true }
		]
	}],


	getToolType: function() {
		var shapeFull = this.down('toolbar[cls=shape-picker]').down('[pressed]').option;
		shapeFull = shapeFull.replace('shape', '').trim();
		if (shapeFull === 'square' || shapeFull === 'triangle' || shapeFull === 'poly') {
			return 'polygon';
		}
		return shapeFull;
	},


	setOptions: function(options) {
		var shapeOptions = this.down('toolbar[cls=shape-options]'),
			shapePicker = this.down('toolbar[cls=shape-picker]');

		if(options.stroke){
			this.down('[stroke='+options.stroke+']').toggle(true);
		}
		if (options.strokeWidth) {
			this.down('[strokeWidth='+options.strokeWidth+']').toggle(true);
		}
		if(options.fill) {

		}
		if (options.sides) {
			if (options.sides === 3){}
			else if (options.sides === 4){}
			else if (options.sides === 1){}
			else {}
		}
	},


	getOptions: function(){
		var toolbar = this.down('toolbar[cls=shape-options]'),
			fillButton = toolbar.down('[fillSelect]'),
			strokeButton = toolbar.down('[strokeSelect]'),
			shapeToolbar = this.down('toolbar[cls=shape-picker]').down('[pressed]'),
			stroke, strokeWidth, fill, sides;

		sides = shapeToolbar.sides || shapeToolbar.value || null;
		fill = fillButton.getValue();
		stroke = strokeButton.getValue();
		strokeWidth = this.down('stroke-select').getValue();

		return {
			sides: sides,
			fill: fill,
			stroke:	stroke,
			strokeWidth: strokeWidth
		};
	}
});
