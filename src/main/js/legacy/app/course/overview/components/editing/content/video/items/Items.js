const Ext = require('extjs');

const DndOrderingContainer = require('legacy/mixins/dnd/OrderingContainer');
const Video = require('legacy/model/Video');
const VideoRoll = require('legacy/model/VideoRoll');

require('./Item');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.video.items.Items', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-video-items',

	mixins: {
		OrderingContainer: 'NextThought.mixins.dnd.OrderingContainer'
	},

	cls: 'video-items',
	layout: 'none',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		var me = this,
			parts = [
				{tag: 'span', cls: 'reorder', html: 'Drag to Reorder'},
				{tag: 'span', cls: 'add', html: '+ Add Videos'}
			];

		me.headerCmp = me.add({
			xtype: 'box',
			autoEl: {
				cls: 'video-items-header',
				cn: parts
			},
			listeners: {
				click: {
					element: 'el',
					fn: e => {
						if (e.getTarget('.add') && this.onAddVideos) {
							this.onAddVideos(this.selectedItems, (...args) => this.updateItem(...args));
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

		me.setDataTransferHandler(Video.mimeType, {
			onDrop: this.reorderVideo.bind(this),
			isValid: DndOrderingContainer.hasMoveInfo,
			effect: 'move'
		});
	},

	updateItem (item) {
		const itemId = item.ntiid || item.NTIID;
		const newItems = this.selectedItems.map(x => {
			const id = x.ntiid || x.NTIID || x.internalId;

			if (id === itemId) {
				const links = x.get('Links');
				item.Links = links;
				Object.assign(x, {data: item, raw: item.Links.links});
			}

			return x;
		});

		this.selectedItems = newItems;
	},

	getDropzoneTarget: function () {
		return this.itemsCmp && this.itemsCmp.el && this.itemsCmp.el.dom;
	},

	getOrderingItems: function () {
		var items = this.itemsCmp && this.itemsCmp.items && this.itemsCmp.items.items;

		return items || [];
	},

	getItemsFromRecord: function (record) {
		if (record instanceof VideoRoll) {
			return [...record.get('Items')];
		}

		return [record];
	},

	getItems: function () {
		return this.selectedItems;
	},

	addItems: function (items) {
		var me = this,
			single = items.length === 1;

		me.disableOrderingContainer();

		function removeItems (remove) {
			me.addItems(items.filter(function (item) {
				return item.getId() !== remove.getId();
			}));
		}

		me.selectedItems = items;

		me.itemsCmp.removeAll(true);

		me.itemsCmp.add(items.map(function (item, index) {
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

	reorderVideo: function (video, newIndex, moveInfo) {
		var items = this.getItems(),
			contains = items.filter(function (item) { return item.getId() === video.getId(); }),
			oldIndex = moveInfo.getIndex();

		if (!contains) { return Promise.resolve(); }

		items.splice(newIndex, 0, items.splice(oldIndex, 1)[0]);

		this.addItems(items);

		return Promise.resolve();
	}
});
