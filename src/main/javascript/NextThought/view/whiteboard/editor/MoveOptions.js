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
		cls: 'shape-options',
		defaults: {
			ui: 'option',
			scale: 'large'
		},
		items: [
			{ xtype: 'tbtext', text: 'Fill', fillLabel: true},
			{ xtype: 'color-picker-button', fillSelectMove: true, value: 'E1E1E1'},
			'Stroke',
//			{ xtype: 'stroke-select', value: 3 },
			{ xtype: 'color-picker-button', strokeSelectMove: true, value: '333333'}
		]
		}
	],

	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.down('toolbar[cls=shape-options]').down('[fillSelectMove]').el, 'select', function(e){
			console.log("received event in moveOptions");
		});
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
			strokeButton = toolbar.down('[strokeSelectMove]'), val;

		if(options.stroke){
			val = Color.rgbaToHex(options.stroke).substr(1).toUpperCase();
			strokeButton.setValue(val);
		}
		if(options.fill) {
			val = Color.rgbaToHex(options.fill).substr(1).toUpperCase();
			fillButton.setValue(val);
		}
		//		if (options.strokeWidth) {
////			this.down('[strokeWidth='+options.strokeWidth+']').toggle(true);
//			this.down('stroke-select').setValue(options.strokeWidth);
//		}
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
