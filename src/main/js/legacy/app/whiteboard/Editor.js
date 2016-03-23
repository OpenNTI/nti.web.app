var Ext = require('extjs');
var MixinsShapeManipulation = require('./editor/mixins/ShapeManipulation');
var MixinsToolOptionsState = require('./editor/mixins/ToolOptionsState');
var WhiteboardCanvas = require('./Canvas');
var EditorTools = require('./editor/Tools');


module.exports = exports = Ext.define('NextThought.app.whiteboard.Editor', {
	extend: 'Ext.panel.Panel',
	alias:	'widget.whiteboard-editor',

	mixins: {
		interaction: 'NextThought.app.whiteboard.editor.mixins.ShapeManipulation',
		toolState: 'NextThought.app.whiteboard.editor.mixins.ToolOptionsState'
	},

	MimeType: 'application/vnd.nextthought.canvas',
	autoScroll: true,
	border: false,
	ui: 'whiteboard-editor',
	layout: 'none',

	items: [
		{ xtype: 'whiteboard-tools', dock: 'top' },
		{xtype: 'whiteboard-canvas', anchor: '100%'}
	],

	initComponent: function() {
		this.callParent(arguments);

		this.canvas = this.down('whiteboard-canvas');
		this.toolbar = this.down('whiteboard-tools');
		this.canvas.updateData(this.value);

		this.mixins.toolState.constructor.apply(this);
	},

	constructor: function() {
		// this.maxHeight = 635; // FIXME: Naturally we shouldn't hardcode this. But we need some kind of maxHeight.
		this.callParent(arguments);
	},

	afterRender: function() {
		this.callParent(arguments);

		var parentWin = this.up('window');

		if (parentWin && parentWin.readonly) {
			this.toolbar.disable().hide();
		}
		else {
			this.initMixin(this.toolbar, this.canvas);
		}

		this.mon(this.up('wb-window'), 'activate', function() {this.canvas.drawScene();}, this);

		this.canvas.hasResized(this, this.getWidth(), this.getHeight());
	},

	reset: function() {
		this.value = Ext.clone(this.initialConfig.value);
		this.canvas.updateData(this.value);

	},

	getValue: function() {
		return this.canvas.getData();
	},

	getThumbnail: function(callback) {
		return NextThought.app.whiteboard.Canvas.getThumbnail(this.canvas.getData(), callback);
	}
});
