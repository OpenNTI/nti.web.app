const Ext = require('extjs');

const Scrolling = require('../../util/Scrolling');

const DndStateStore = require('./StateStore');

require('../../common/Actions');


module.exports = exports = Ext.define('NextThought.app.dnd.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function (config) {
		this.callParent(arguments);

		this.DnDStore = DndStateStore.getInstance();

		this.pageScrolling = Scrolling.getPageScrolling();
	},

	startDrag: function (activeItem) {
		if (!this.DnDStore.getActiveDragItem()) {
			this.addWindowScrollListeners();
		}

		this.DnDStore.setActiveDragItem(activeItem);
	},

	endDrag: function (activeItem) {
		this.DnDStore.removeActiveDragItem(activeItem);

		if (!this.DnDStore.getActiveDragItem()) {
			this.removeWindowScrollListeners();
		}
	},

	getPlaceholderStyles: function () {
		return this.DnDStore.getPlaceholderStyles();
	},

	onNoDropHandler: function () {
		this.onDropFail();
	},

	onDropFail: function () {
		var activeDragItem = this.DnDStore.getActiveDragItem();

		if (activeDragItem) {
			activeDragItem.onNoDrop();
		}
	},

	addWindowScrollListeners: function () {
		this.pageScrolling.scrollWhenDragNearEdges();
	},

	removeWindowScrollListeners: function () {
		this.pageScrollign.unscrollWhenDragNearEdges();
	},

	removeAllPlaceholders: function () {
		var placeholders = document.querySelector('.dnd-drop-placeholder, .dnd-save-placeholder');

		if(placeholders instanceof Array) {
			placeholders.forEach(function (placeholder) {
				placeholder.remove();
			});
		} else if(placeholders) {
			placeholders.remove();
		}
	}
});
