const Ext = require('@nti/extjs');

require('legacy/mixins/dnd/Draggable');

const DndOrderingItem =
module.exports = exports = Ext.define('NextThought.mixins.dnd.OrderingItem', {
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


	VERTICAL_TOLERANCE: 2,
	HORIZONTAL_TOLERANCE: 20,
	isOrderingItem: true,


	enableOrdering: function (index, onDragStart, onDragEnd) {
		this.orderingIndex = index;
		this.onDragStart = onDragStart;
		this.onDragEnd = onDragEnd;
		this.enableDragging();
	},


	disableOrdering: function () {
		this.disableDragging();
	},


	getVerticalMidpoint: function () {
		var rect = this.__getRect();

		return rect.top + (rect.height / 2);
	},


	getHorizontalMidpoint: function () {
		var rect = this.__getRect();

		return rect.left + (rect.width / 2);
	},


	__getRect: function () {
		return this.lockedRect || this.getDragBoundingClientRect();
	},


	lockRectRelative: function (parent) {
		var rect = this.getDragBoundingClientRect(),
			top = rect.top - parent.top,
			left = rect.left - parent.left,
			width = rect.width,
			height = rect.height;

		this.lockedRect = {
			top: top,
			left: left,
			right: left + width,
			bottom: top + height,
			width: width,
			height: height
		};
	},


	unlockRect: function () {
		// this.lockedRect = null;
	},


	__getTopOrBottom: function (x, y) {
		var midpoint = this.getVerticalMidpoint(), side;

		if (y < midpoint) {
			side = DndOrderingItem.SIDES.TOP;
		} else {
			side = DndOrderingItem.SIDES.BOTTOM;
		}

		return side;
	},


	__getLeftOrRight: function (x, y) {
		var midpoint = this.getHorizontalMidpoint(), side;

		if (x < midpoint) {
			side = DndOrderingItem.SIDES.LEFT;
		} else {
			side = DndOrderingItem.SIDES.RIGHT;
		}

		return side;
	},

	getPlaceholderBeforeHeight: function () {
		var rect = this.__getRect();

		return rect.height;
	},


	getPlaceholderAfterHeight: function () {
		var rect = this.__getRect();

		return rect.height;
	},


	isFullWidth: function (fullWidth) {
		var rect = this.__getRect();

		return Math.abs(fullWidth - rect.width) <= (this.HORIZONTAL_TOLERANCE * 2);
	},


	isPointContainedVertically: function (x, y) {
		var rect = this.__getRect(),
			tol = this.VERTICAL_TOLERANCE;

		return y >= (rect.top - tol) && y <= (rect.bottom - tol);
	},


	isPointAbove: function (x, y) {
		var side = this.__getTopOrBottom(x, y);

		return side === DndOrderingItem.SIDES.TOP;
	},


	isPointBelow: function (x, y) {
		var side = this.__getTopOrBottom(x, y);

		return side === DndOrderingItem.SIDES.BOTTOM;
	},


	isPointLeft: function (x, y) {
		var side = this.__getLeftOrRight(x, y);

		return side === DndOrderingItem.SIDES.LEFT && this.isPointContainedVertically(x, y);
	},


	isPointRight: function (x, y) {
		var side = this.__getLeftOrRight(x, y);

		return side === DndOrderingItem.SIDES.RIGHT && this.isPointContainedVertically(x, y);
	},


	isPointBefore: function (x, y) {
		return this.isPointAbove(x, y) || this.isPointLeft(x, y);
	},


	isPointAfter: function (x, y, isFullWidth) {
		return this.isPointBelow(x, y) || this.isPointRight(x, y);
	},


	isSameRow: function (orderingItem) {
		if (!orderingItem.getVerticalMidpoint) {
			console.error('Invalid Ordering Item');
			return false;
		}

		return (this.getVerticalMidpoint() - orderingItem.getVerticalMidpoint()) <= this.VERTICAL_TOLERANCE;
	}
});
