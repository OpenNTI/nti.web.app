Ext.define('NextThought.mixins.dnd.OrderingItem', {
	mixins: {
		Draggable: 'NextThought.mixins.dnd.Draggable'
	},


	enableOrdering: function(index) {
		this.orderingIndex = index;
		this.enableDragging();
	},


	disableOrdering: function() {
		this.disableDragging();
	},


	isPointBefore: function(x, y) {
	},


	isPointAfter: function(x, y) {

	}
});
