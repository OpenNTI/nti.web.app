Ext.define('NextThought.app.course.overview.components.editing.content.video.items.Items', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-video-items',

	requires: [
		'NextThought.model.Video',
		'NextThought.app.course.overview.components.editing.content.video.items.Item'
	],

	mixins: {
		OrderingContainer: 'NextThought.mixins.dnd.OrderingContainer'
	},

	cls: 'video-items',

	layout: 'none',
	items: [],

	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		me.headerCmp = me.add({
			xtype: 'box',
			autoEl: {
				cls: 'video-items-header',
				cn: [
					{tag: 'span', cls: 'reorder', html: 'Drag to Reorder'},
					{tag: 'span', cls: 'add', html: '+ Add Videos'}
				]
			},
			listeners: {
				click: {
					element: 'el',
					fn: function(e) {
						if (e.getTarget('.add') && me.onAddVideos) {
							me.onAddVideos(me.selectedItems);
						}
					}
				}
			}
		});


		me.itemsCmp = me.add({
			xtype: 'container',
			cls: 'items-container',
			layout: 'none',
			items: []
		});

		me.addItems(me.getItems());

		me.setDataTransferHandler(NextThought.model.Video.mimeType, me.reorderVideo.bind(me));
	},


	getDropTarget: function() {
		return this.itemsCmp && this.itemsCmp.el && this.itemsCmp.el.dom;
	},


	getOrderingItems: function() {
		var items = this.itemsCmp && this.itemsCmp.items && this.itemsCmp.items.items;

		return items || [];
	},


	getItems: function() {
		return this.selectedItems;
	},


	addItems: function(items) {
		var me = this;

		// me.disableOrderingContainer();

		function removeItems(remove) {
			me.addItems(items.filter(function(item) {
				return item.getId() !== remove.getId();
			}));
		}

		me.selectedItems = items;

		me.itemsCmp.removeAll(true);

		me.itemsCmp.add(items.map(function(item) {
			return {
				xtype: 'overview-editing-video-items-item',
				item: item,
				removeItem: removeItems.bind(me, item)
			};
		}));

		// me.enableOrderingContainer();
	},


	reorderVideo: function(video, newIndex, moveInfo) {}
});
