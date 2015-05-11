Ext.define('NextThought.app.whiteboard.Editor', {
	extend:	'Ext.panel.Panel',
	alias:	'widget.whiteboard-editor',
	requires: [
		'NextThought.app.whiteboard.Canvas',
		'NextThought.app.whiteboard.editor.Tools'
	],
	mixins: {
		interaction: 'NextThought.app.whiteboard.editor.mixins.ShapeManipulation',
		toolState: 'NextThought.app.whiteboard.editor.mixins.ToolOptionsState'
	},

	MimeType: 'application/vnd.nextthought.canvas',

	autoScroll: true,
	border: false,
	ui: 'whiteboard-editor',
	layout: 'anchor',
	dockedItems: [
		{ xtype: 'whiteboard-tools', dock: 'top' }
	],
	items: [{xtype: 'whiteboard-canvas', anchor: '100%'}],

	initComponent: function() {
		this.callParent(arguments);

		this.canvas = this.down('whiteboard-canvas');
		this.toolbar = this.down('whiteboard-tools');
		this.canvas.updateData(this.value);

		this.mixins.toolState.constructor.apply(this);
	},

	constructor: function() {
		this.maxHeight = 635; // FIXME: Naturally we shouldn't hardcode this. But we need some kind of maxHeight.
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
