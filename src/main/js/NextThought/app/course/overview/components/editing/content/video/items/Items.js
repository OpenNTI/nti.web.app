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

		if (this.record && !this.selectedItems) {
			this.selectedItems = this.getItemsFromRecord(this.record);
		}

		me.addItems(me.getItems());

		me.setDataTransferHandler(NextThought.model.Video.mimeType, {
			onDrop: this.reorderVideo.bind(this),
			isValid: NextThought.mixins.dnd.OrderingContainer.hasMoveInfo,
			effect: 'move'
		});
	},


	getDropzoneTarget: function() {
		return this.itemsCmp && this.itemsCmp.el && this.itemsCmp.el.dom;
	},


	getOrderingItems: function() {
		var items = this.itemsCmp && this.itemsCmp.items && this.itemsCmp.items.items;

		return items || [];
	},


	getItemsFromRecord: function(record) {
		if (record instanceof NextThought.model.VideoRoll) {
			return record.get('Items');
		}

		return [record];
	},


	getItems: function() {
		return this.selectedItems;
	},


	addItems: function(items) {
		var me = this,
			single = items.length === 1;

		me.disableOrderingContainer();

		function removeItems(remove) {
			me.addItems(items.filter(function(item) {
				return item.getId() !== remove.getId();
			}));
		}

		me.selectedItems = items;

		me.itemsCmp.removeAll(true);

		me.itemsCmp.add(items.map(function(item, index) {
			return {
				xtype: 'overview-editing-video-items-item',
				item: item,
				index: index,
				removeItem: !single && removeItems.bind(me, item)
			};
		}));

		if (!single) {
			me.enableOrderingContainer();
		}
	},


	reorderVideo: function(video, newIndex, moveInfo) {
		var items = this.getItems(),
			contains = items.filter(function(item) { return item.getId() === video.getId(); }),
			oldIndex = moveInfo.getIndex();

		if (!contains) { return Promise.resolve(); }

		items.splice(newIndex, 0, items.splice(oldIndex, 1)[0]);

		this.addItems(items);

		return Promise.resolve();
	}
});
