Ext.define('NextThought.view.whiteboard.editor.MoveOptions',{
	alias: 'widget.wb-tool-move-options',
	extend: 'Ext.toolbar.Toolbar',
	requires: [
		'NextThought.view.whiteboard.editor.ColorPickerButton',
		'NextThought.view.whiteboard.editor.StrokeWidthSelector',
		'NextThought.view.whiteboard.editor.ToolOption',
		'NextThought.util.Color'
	],

	ui: 'options',
	layout: {
		type:'hbox',
		align: 'stretchmax'
	},
	items: [{
		xtype: 'toolbar',
		ui: 'options',
		cls: 'move-action-picker',
		defaults: {
			xtype: 'wb-tool-option',
			toggleGroup: 'move-selected-'
		},
		items: [
			{ option: 'move back', isEditAction:true},
			{ option: 'move forward', isEditAction:true},
			{ option: 'move duplicate ', isEditAction:true},
			{ option: 'move delete', isEditAction: true}
			//		{ text: 'Edit Object'},'-',
		]
	},{
		xtype: 'toolbar',
		ui: 'options',
		cls: 'pencil-stroke-options',
		pathSelectStrokeWidth: true,
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
		xtype: 'toolbar',
		ui: 'options',
		cls: 'shape-options',
		defaults: {
			ui: 'option',
			scale: 'large'
		},
		items: [
			{ xtype: 'tbtext', text: 'Fill', fillLabel: true},
			{ xtype: 'color-picker-button', fillSelectMove: true, value: 'E1E1E1'},
			'Stroke',
			{ xtype: 'stroke-select', value: 3, editStrokeWidth: true },
			{ xtype: 'color-picker-button', strokeSelectMove: true, value: '333333'}
		]
		}
	],

	initComponent: function(){
		this.addEvents({'wb-options-change': true });
		this.enableBubble(['wb-options-change']);
		this.callParent(arguments);
	},

	afterRender: function(){
		this.callParent(arguments);
		var me = this;

		Ext.each( me.query('color-picker-button'), function(i){
			me.mon(i.palette, { select: function(){	me.fireEvent('wb-options-change', me);} });
		});

		me.mon(me.down('stroke-select'), {
			scope: this,
			select: function(){ me.fireEvent('wb-options-change', me); },
			change: function(){ me.fireEvent('wb-options-change', me); }
		});

		//By Default hide the path stroke picker
		this.down('toolbar[cls=pencil-stroke-options]').hide();
	},

	getToolType: function() {
		return 'move';
	},

	getActionType: function(){
		var b = Ext.Array.filter(this.query('[isEditAction]'), function(x){ return x.pressed; });
		if(!b || b.length === 0){ return; }
		return b[0].option.replace('move', '').trim();
	},

	setOptions: function(options) {
		var toolbar = this.down('toolbar[cls=shape-options]'),
			fillButton = toolbar.down('[fillSelectMove]'),
			strokeButton = toolbar.down('[strokeSelectMove]'), val, s, hex;

		if(!options){ return; }
		if(options.shapeType){
			s = options.shapeType.split('.').pop().toLowerCase();

			if(s === 'path'){
				this.down('[fillLabel]').hide();
				this.down('[fillSelectMove]').hide();
				this.down('[editStrokeWidth]').hide();

				this.down('toolbar[cls=pencil-stroke-options]').show();
			}else{
				this.down('[fillLabel]').show();
				this.down('[fillSelectMove]').show();
				this.down('[editStrokeWidth]').show();

				this.down('toolbar[cls=pencil-stroke-options]').hide();
			}
		}

		if(options.stroke){
            val = null;
            if (options.stroke !== 'NONE'){
	            hex = Color.rgbaToHex(options.stroke);
	            val = hex[0] === '#' ? hex.substr(1).toUpperCase() : hex.toUpperCase();
            }
            strokeButton.setValue(val);
		}
		if(options.fill) {
            val = null;
            if (options.fill !== 'NONE'){
	            hex = Color.rgbaToHex(options.fill);
	            val = hex[0] === '#' ? hex.substr(1).toUpperCase() : hex.toUpperCase();
            }
			fillButton.setValue(val);
		}

		this.setStrokeWidthValue(options.strokeWidth, options.shapeType);
	},

	setStrokeWidthValue: function(strokeValue, shapeType){
		if(!shapeType){ return;}
		var s = shapeType.split('.').pop().toLowerCase(), a, sel, btn;

		if(s !== 'path'){
			this.down('[editStrokeWidth]').setSelected( strokeValue);
		}
		else {
			a = this.query('[strokeWidth]');
			Ext.each(a, function(i){
				if(i.pressed){ i.toggle(); }
			});

			sel = '[strokeWidth='+strokeValue+']';
			btn = this.down(sel);
			if(btn){ btn.toggle(); }
		}
	},

	getOptions: function(){
		var toolbar = this.down('toolbar[cls=shape-options]'),
			fillButton = toolbar.down('[fillSelectMove]'),
			strokeButton = toolbar.down('[strokeSelectMove]'),
			stroke, strokeWidth, fill;

		fill = fillButton.getValue();
		stroke = strokeButton.getValue();
		strokeWidth = this.down('stroke-select').getValue();

		return {
			fill: fill,
			stroke:	stroke,
			strokeWidth: strokeWidth
		};
	}
});
