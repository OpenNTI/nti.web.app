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
			{ tool: 'move', pressed: true },
			{ tool: 'pencil' },
			{ tool: 'shape' },
			{ tool: 'text' },
			{ tool: 'image' },
			{ tool: 'eraser', disabled: true }
		]
	},{
		ui: 'secondary',
		xtype: 'container',
		layout: 'card',
		defaults: {
			height: 60
		},
		items: [
			{xtype: 'wb-tool-move-options'},
			{xtype: 'wb-tool-pencil-options'},
			{xtype: 'wb-tool-shape-options'},
			{xtype: 'wb-tool-text-options'},
			{xtype: 'wb-tool-image-options'}
//			{xtype: 'wb-tool-eraser-options'}
		]
	}]
});
