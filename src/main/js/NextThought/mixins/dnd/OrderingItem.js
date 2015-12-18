Ext.define('NextThought.mixins.dnd.OrderingItem', {
	statics: {
		SIDES: {
			TOP: 't',
			BOTTOM: 'b',
			LEFT: 'l',
			RIGHT: 'r'
		}
	},

	mixins: {
		Draggable: 'NextThought.mixins.dnd.Draggable'
	},


	TOLERANCE: 2,


	enableOrdering: function(index, onDragStart, onDragEnd) {
		this.orderingIndex = index;
		this.onDragStart = onDragStart;
		this.onDragEnd = onDragEnd;
		this.enableDragging();
	},


	disableOrdering: function() {
		this.disableDragging();
	},


	__getTopOrBottom: function(x, y) {
		var rect = this.getDragBoundingClientRect(),
			midpoint, side;

		midpoint = rect.top + (rect.height / 2);

		if (y < midpoint) {
			side = NextThought.mixins.dnd.OrderingItem.SIDES.TOP;
		} else {
			side = NextThought.mixins.dnd.OrderingItem.SIDES.BOTTOM;
		}

		return side;
	},


	__getLeftOrRight: function(x, y) {
		var rect = this.getDragBoundingClientRect(),
			midpoint, side;

		midpoint = rect.left + (rect.width / 2);

		if (x < midpoint) {
			side = NextThought.mixins.dnd.OrderingItem.SIDES.LEFT;
		} else {
			side = NextThought.mixins.dnd.OrderingItem.SIDES.RIGHT;
		}

		return side;
	},

	getPlaceholderBeforeHeight: function() {
		var rect = this.getDragBoundingClientRect();

		return rect.height;
	},


	getPlaceholderAfterHeight: function() {
		var rect = this.getDragBoundingClientRect();

		return rect.height;
	},


	isFullWidth: function(fullWidth) {
		var rect = this.getDragBoundingClientRect();

		return Math.abs(fullWidth - rect.width) <= this.TOLERANCE;
	},


	isPointContainedVertically: function(x, y) {
		var rect = this.getDragBoundingClientRect(),
			tol = this.TOLERANCE;

		return Math.abs(rect.top - y) <= tol && Math.abs(rect.bottom - y <= tol);
	},


	isPointAbove: function(x, y) {
		var side = this.__getTopOrBottom(x, y);

		return side === NextThought.mixins.dnd.OrderingItem.SIDES.TOP;
	},


	isPointBelow: function(x, y) {
		var side = this.__getTopOrBottom(x, y);

		return side === NextThought.mixins.dnd.OrderingItem.SIDES.BOTTOM;
	},


	isPointLeft: function(x, y) {
		var side = this.__getLeftOrRight(x, y);

		return side === NextThought.mixins.dnd.OrderingItem.SIDES.LEFT && this.isPointContainedVertically(x, y);
	},


	isPointRight: function(x, y) {
		var side = this.__getLeftOrRight(x, y);

		return side === NextThought.mixins.dnd.OrderingItem.SIDES.RIGHT && this.isPointContainedVertically(x, y);
	},


	isPointBefore: function(x, y) {
		return this.isPointAbove(x, y) || this.isPointLeft(x, y);
	},


	isPointAfter: function(x, y) {
		return this.isPointBelow(x, y) || this.isPointRight(x, y);
	}
});
