var Ext = require('extjs');
var EditorColorOption = require('./ColorOption');
var EditorToolOption = require('./ToolOption');
var {guidGenerator} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.whiteboard.editor.EraserOptions', {
    alias: 'widget.wb-tool-eraser-options',
    extend: 'Ext.container.Container',
    ui: 'options',
    layout: 'none',

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

    constructor: function() {
		this.items = Ext.clone(this.items);//copy onto instance from prototype
		this.items[0].defaults.toggleGroup += guidGenerator();
		this.callParent(arguments);
	},

    getToolType: function() {
		return 'pencil';
	},

    setOptions: function(options) {
		if (options.strokeWidth) {
			this.down('[strokeWidth=' + options.strokeWidth + ']').toggle(true);
		}
		if (options.fill) {
			console.error('fill is not supported for pencil');
		}
	},

    getOptions: function() {
		var pressed = this.query('button[pressed]'),
			strokeWidth;

		Ext.each(pressed, function(b) {
			if (b.strokeWidth) {
				strokeWidth = b.strokeWidth;
			}
		});

		return {
			fill: null, //TODO - not implemented in design
			stroke:	'#FFFFFF',
			strokeWidth: strokeWidth
		};
	}
});
