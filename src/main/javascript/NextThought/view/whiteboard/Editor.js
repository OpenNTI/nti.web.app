Ext.define(	'NextThought.view.whiteboard.Editor',{
	extend:	'Ext.panel.Panel',
	alias:	'widget.whiteboard-editor',
	requires: [
		'NextThought.view.whiteboard.Canvas',
		'NextThought.view.whiteboard.editor.Tools'
	],
	mixins:{
		interaction: 'NextThought.view.whiteboard.editor.mixins.ShapeManipulation'
	},

	autoScroll: true,
	border: false,
	ui: 'whiteboard-editor',
	layout: 'anchor',
	dockedItems: [
		{ xtype: 'whiteboard-tools', dock: 'top' }
	],
	items: [{xtype: 'whiteboard-canvas', anchor: '100%'}],

	initComponent: function(){
		this.callParent(arguments);

		this.canvas = this.down('whiteboard-canvas');
		this.toolbar = this.down('whiteboard-tools');
		this.canvas.updateData(this.value);
	},


	afterRender: function(){
		this.callParent(arguments);

		var parentWin = this.up('window');
		if (parentWin && parentWin.readonly) {
			this.toolbar.disable().hide();
		}
		else{
			this.initMixin(this.toolbar, this.canvas);
		}
	},

	reset: function(){
		this.value = Ext.clone(this.initialConfig.value);
		this.canvas.updateData(this.value);
	},


	getValue: function(){
		return this.canvas.getData();
	},


	getThumbnail: function(callback){
		return NextThought.view.whiteboard.Canvas.getThumbnail(this.canvas.getData(),callback);
	}
});
