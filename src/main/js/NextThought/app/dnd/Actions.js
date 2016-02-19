Ext.define('NextThought.app.dnd.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.dnd.StateStore',
		'NextThought.util.Scrolling'
	],


	constructor: function(config) {
		this.callParent(arguments);

		this.DnDStore = NextThought.app.dnd.StateStore.getInstance();

		this.pageScrolling = NextThought.util.Scrolling.getPageScrolling();
	},



	startDrag: function(activeItem) {
		if (!this.DnDStore.getActiveDragItem()) {
			this.addWindowScrollListeners();
		}

 		this.DnDStore.setActiveDragItem(activeItem);
	},


	endDrag: function(activeItem) {
		this.DnDStore.removeActiveDragItem(activeItem);

		if (!this.DnDStore.getActiveDragItem()) {
			this.removeWindowScrollListeners();
		}
	},


	getPlaceholderStyles: function() {
		return this.DnDStore.getPlaceholderStyles();
	},


	onNoDropHandler: function() {
		this.onDropFail();
	},


	onDropFail: function() {
		var activeDragItem = this.DnDStore.getActiveDragItem();

		if (activeDragItem) {
			activeDragItem.onNoDrop();
		}
	},


	addWindowScrollListeners: function() {
		this.pageScrolling.scrollWhenDragNearEdges();
	},


	removeWindowScrollListeners: function() {
		this.pageScrollign.unscrollWhenDragNearEdges();
	}
});
