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
			toggleGroup: 'pencil-stroke-'
		},
		items: [
			{ option: 'fine stroke', strokeWidth: 5, pressed: true },
			{ option: 'small stroke', strokeWidth: 10 },
			{ option: 'medium stroke', strokeWidth: 20},
			{ option: 'large stroke', strokeWidth: 30 }
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
			toggleGroup: 'pencil-color-'
		},
		items: [
			{ color: 'black', stroke: '#333333', pressed: true },
			{ color: 'grey1', stroke: '#858585' },
			{ color: 'grey2', stroke: '#E1E1E1' },
			{ color: 'white', stroke: '#ffffff' },
			{ color: 'red', stroke: '#d34f39' },
			{ color: 'blue', stroke: '#2b89c5' },
			{ color: 'green', stroke: '#a0c94c' },
			{ color: 'orange', stroke: '#fa8700' },
			{ color: 'magenta', stroke: '#b42789' },
			{ color: 'purple', stroke: '#6f3d93' },
			{ color: 'yellow', stroke: '#fff02a' }
		]
	}],


	constructor:function(){
		this.items = Ext.clone(this.items);//copy onto instance from prototype
		this.items[0].defaults.toggleGroup += guidGenerator();
		this.items[1].defaults.toggleGroup += guidGenerator();
		console.log(this);
		return this.callParent(arguments);
	},


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
				strokeWidth = b.strokeWidth;
			}
			else if (b.stroke) {
				stroke = b.stroke;
			}
		});

		return {
			fill: null, //TODO - not implemented in design
			stroke:	stroke,
			strokeWidth: strokeWidth
		};
	}
});
