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
			toggleGroup: 'shape-selected-',
            handler: function(btn){
                var me = btn.up('wb-tool-shape-options'),
					fill = me.down('color-picker-button[fillSelect]'),
					lbl = me.down('tbtext[fillLabel]');
                if(btn.sides===1){
                    fill.disable();
					fill.hide();
					lbl.hide();
                }else{
					fill.show();
					lbl.show();
					fill.enable();
                }
            }
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
			{ xtype: 'tbtext', text: 'Fill', fillLabel: true, hidden: true },
			{ xtype: 'color-picker-button', fillSelect: true, value: 'E1E1E1', disabled: true, hidden: true },
			'Stroke',
			{ xtype: 'stroke-select', value: 3 },
			{ xtype: 'color-picker-button', strokeSelect: true, value: '333333' }
		]
	}],


	constructor: function(){
		this.items = Ext.clone(this.items);//copy onto instance from prototype
		this.items[0].defaults.toggleGroup += guidGenerator();
		return this.callParent(arguments);
	},

	initComponent: function(){
		this.addEvents({'wb-options-change': true });
		this.enableBubble(['wb-options-change']);
		this.callParent(arguments);
	},

	afterRender: function(){
		var me = this;
		me.callParent(arguments);

		Ext.each( me.query('wb-tool-option'), function(i){
			me.mon(i.el, {
				click: function(){
					me.fireEvent('wb-options-change', me);
				}
			});
		});

		Ext.each( me.query('color-picker-button'), function(i){
			me.mon(i.palette, {
				select: function(){
					me.fireEvent('wb-options-change', me);
				}
			});
		});

		me.mon(me.down('stroke-select'), {
			scope: this,
			select: function(){ me.fireEvent('wb-options-change', me); },
			change: function(){ me.fireEvent('wb-options-change', me); }
		});
	},


	getToolType: function() {
		var shapeFull = this.down('toolbar[cls=shape-picker]').down('[pressed]').option;
		shapeFull = shapeFull.replace('shape', '').trim();
		if (shapeFull === 'square' || shapeFull === 'triangle' || shapeFull === 'poly') {
			return 'polygon';
		}
		return shapeFull;
	},


	setOptions: function(options) {
		var shapePicker = this.down('toolbar[cls=shape-picker]'),
			button;

		if(options.stroke){
			this.down('[strokeSelect]').setValue(options.stroke);
		}
		if(options.fill) {
			this.down('[fillSelect]').setValue(options.fill);

			if(!options.sides || options.sides !== 1){
				this.down('[fillSelect]').show();
				this.down('[fillLabel]').show();
			}
		}
		if (options.strokeWidth) {
			this.down('stroke-select').setValue(options.strokeWidth);
		}
		if (options.sides !== null) {
			button = shapePicker.down('[sides='+options.sides+']') || shapePicker.down('wb-tool-option[option="poly shape"]');
			button.setValue(options.sides);
		}
		else {
			//circle
			shapePicker.down('wb-tool-option[option="circle shape"]').toggle(true);
		}
	},


	getOptions: function(){
		var toolbar = this.down('toolbar[cls=shape-options]'),
			fillButton = toolbar.down('[fillSelect]'),
			strokeButton = toolbar.down('[strokeSelect]'),
			shapeToolbar = this.down('toolbar[cls=shape-picker]').down('[pressed]'),
			stroke, strokeWidth, fill, sides;

		sides = shapeToolbar.sides || shapeToolbar.value || null;
		fill = sides !== 1 ? fillButton.getValue() : 'NONE';
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
