Ext.define('NextThought.view.whiteboard.editor.Tools',{
	alias: 'widget.whiteboard-tools',
	extend: 'Ext.container.Container',
	requires: [
		'NextThought.view.whiteboard.editor.ImageOptions',
		'NextThought.view.whiteboard.editor.MoveOptions',
		'NextThought.view.whiteboard.editor.PencilOptions',
		'NextThought.view.whiteboard.editor.ShapeOptions',
		'NextThought.view.whiteboard.editor.TextOptions',
		'NextThought.view.whiteboard.editor.Tool'
	],

	ui: 'container',
	baseCls: 'whiteboard-tools',

	layout: 'anchor',
	defaults: {
		anchor: '100%',
		baseCls: 'whiteboard-tools'
	},
	items:[{
		ui: 'primary',
		xtype:'toolbar',
		defaults: { xtype: 'wb-tool' },
		items: [
			{ tool: 'move' },
			{ tool: 'pencil', pressed: true },
			{ tool: 'shape' },
			{ tool: 'text' },
			{ tool: 'image' },
			{ tool: 'eraser', disabled: true }
		]
	},{
		ui: 'secondary',
		xtype: 'container',
		activeItem: 1,
		layout: 'card',
		defaults: {
			height: 60
		},
		items: [
			{xtype: 'wb-tool-move-options', forTool: 'move'},
			{xtype: 'wb-tool-pencil-options', forTool: 'pencil'},
			{xtype: 'wb-tool-shape-options', forTool: 'shape'},
			{xtype: 'wb-tool-text-options', forTool: 'text'},
			{xtype: 'wb-tool-image-options', forTool: 'image'}
//			{xtype: 'wb-tool-eraser-options', forTool: 'eraser'}
		]
	}],

	initComponent: function(){
		var me = this;
		me.callParent(arguments);
		Ext.each(me.query('button[tool]'),function(b){b.on('click',me.switchMenus,me);});
	},


	switchMenus: function(btn){
		var q = Ext.String.format('[forTool={0}]',btn.tool);
		this.down('container[ui=secondary]').getLayout().setActiveItem(this.down(q));
	}
});
