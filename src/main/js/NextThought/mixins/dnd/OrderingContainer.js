Ext.define('NextThought.mixins.dnd.OrderingContainer', {
	mixins: {
		Dropzone: 'NextThought.mixins.dnd.Dropzone'
	},

	initOrdering: function() {
	},


	enableOrdering: function() {
		this.enableDropzone();

		var items = this.getOrderingItems();

		items.forEach(this.enableDraggingOnItem.bind(this));
	},


	disableOrdering: function() {
		this.disableDropzone();

		var items = this.getOrderingItems();

		items.forEach(this.disableDraggingOnItem.bind(this));
	},


	getOrderingItems: function() {
		return [];
	},


	enableDraggingOnItem: function(item, index) {
		if (item && item.enableDragging) {
			item.enableOrdering(index);
		}
	},


	disableDraggingOnItem: function(item) {
		if (item && item.disableDragging) {
			item.disableOrdering();
		}
	},


	getIndexForCoordinates: function(x, y) {
		var items = this.getOrderingItems(),
			i, current;

		for (i = 0; i < items.length; i++) {
			current = items[i];

			if (current.isPointBefore(x, y)) {
				break;
			}
		}

		return i;
	},


	onDragOver: function(e) {
		var index = this.getIndexForCoordinates(e.screenX, e.screenY);
	}
});
