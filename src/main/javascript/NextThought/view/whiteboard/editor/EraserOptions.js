Ext.define('NextThought.view.whiteboard.editor.EraserOptions',{
	alias: 'widget.wb-tool-eraser-options',
	extend: 'Ext.container.Container',
	requires: [
		'NextThought.view.whiteboard.editor.ColorOption',
		'NextThought.view.whiteboard.editor.ToolOption'
	],

	ui: 'options',
	layout: {
		type:'hbox',
		align: 'middle'
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
	}],

	constructor:function(){
		this.items = Ext.clone(this.items);//copy onto instance from prototype
		this.items[0].defaults.toggleGroup += guidGenerator();
		return this.callParent(arguments);
	},


	getToolType: function() {
		return 'pencil';
	},


	setOptions: function(options) {
		if (options.strokeWidth) {
			this.down('[strokeWidth='+options.strokeWidth+']').toggle(true);
		}
		if(options.fill) {
			console.error('fill is not supported for pencil');
		}
	},


	getOptions: function(){
		var pressed = this.query('button[pressed]'),
			strokeWidth;

		Ext.each(pressed, function(b){
			if (b.strokeWidth){
				strokeWidth = b.strokeWidth;
			}
		});

		return {
			fill: null, //TODO - not implemented in design
			stroke:	"#FFFFFF",
			strokeWidth: strokeWidth
		};
	}
});
