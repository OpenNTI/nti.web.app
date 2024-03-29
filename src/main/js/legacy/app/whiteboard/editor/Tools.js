const Ext = require('@nti/extjs');

require('./ImageOptions');
require('./MoveOptions');
require('./PencilOptions');
require('./ShapeOptions');
require('./TextOptions');
require('./EraserOptions');
require('./Tool');

module.exports = exports = Ext.define(
	'NextThought.app.whiteboard.editor.Tools',
	{
		alias: 'widget.whiteboard-tools',
		extend: 'Ext.container.Container',
		ui: 'container',
		baseCls: 'whiteboard-tools',
		layout: 'none',

		defaults: {
			baseCls: 'whiteboard-tools',
		},

		items: [
			{
				ui: 'primary',
				xtype: 'toolbar',
				defaults: { xtype: 'wb-tool' },
				items: [
					{ tool: 'move' },
					{ tool: 'pencil', pressed: true },
					{ tool: 'shape' },
					{ tool: 'text', disabled: true, hidden: true },
					{ tool: 'image' },
					// { tool: 'eraser'}
				],
			},
			{
				ui: 'secondary',
				xtype: 'container',
				activeItem: 1,
				layout: 'card',
				defaults: {
					height: 60,
				},
				items: [
					{ xtype: 'wb-tool-move-options', forTool: 'move' },
					{ xtype: 'wb-tool-pencil-options', forTool: 'pencil' },
					{ xtype: 'wb-tool-shape-options', forTool: 'shape' },
					{ xtype: 'wb-tool-text-options', forTool: 'text' },
					{ xtype: 'wb-tool-image-options', forTool: 'image' },
					// {xtype: 'wb-tool-eraser-options', forTool: 'eraser'}
				],
			},
		],

		initComponent: function () {
			var me = this;
			me.callParent(arguments);

			me.addEvents({ 'wb-tool-change': true });
			me.enableBubble(['wb-tool-change']);

			me.maybeRemoveImageFeature();

			//attach click handlers:
			Ext.each(me.query('button[tool]'), function (b) {
				b.on('click', me.switchMenus, me);
			});
		},

		afterRender: function () {
			var me = this;
			me.callParent(arguments);
			Ext.each(me.query('wb-tool'), function (i) {
				me.mon(i.el, {
					click: function () {
						me.fireEvent('wb-tool-change', me);
					},
				});
			});
		},

		maybeRemoveImageFeature: function () {
			if (Service.canCanvasURL()) {
				return; //images approved, no delete...
			}

			var toolbar = this.down('toolbar'),
				viewContainer = this.down('container'),
				button,
				view;

			//remove image tool if it's not allowed...
			button = this.down('button[tool=image]');
			view = this.down('wb-tool-image-options');

			if (button) {
				button.un('click', this.switchMenus, this);
				toolbar.remove(button, true);
			}
			if (view) {
				viewContainer.remove(view, true);
			}
		},

		switchMenus: function (btn) {
			var q = Ext.String.format('[forTool={0}]', btn.tool);
			delete this.currentTool;
			this.down('container[ui=secondary]')
				.getLayout()
				.setActiveItem(this.down(q));
		},

		setCurrentTool: function (tool) {
			var b = this.down('wb-tool[tool=' + tool + ']');
			b.fireEvent('click', b);
			b.toggle(true);
		},

		getCurrentTool: function () {
			if (!this.currentTool) {
				this.currentTool = this.down('container[ui=secondary]')
					.getLayout()
					.getActiveItem();
			}
			return this.currentTool;
		},
	}
);
