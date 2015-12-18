/**
 * Handle adding and removing listeners for dropping actions
 *
 * Things that mixin this in can implement, onDragStart and onDragEnd
 * to add custom handlers
 *
 * To limit which part of the target can start a drag, things can implement getDragHandle
 * to return an element
 *
 * It can also implement a getDragTarget method, otherwise this.el.dom will be used
 */
Ext.define('NextThought.mixins.dnd.Draggable', {

	requires: [
		'NextThought.model.app.DndInfo',
		'NextThought.store.DataTransfer'
	],


	/**
	 * If we haven't yet, set up the handlers. So we
	 * have the same function to add and remove
	 */
	initDragging: function(data) {
		if (!this.Draggable) {
			this.Draggable = {
				className: this.$className,
				hasHandle: false,
				inHandle: false,
				transferData: new NextThought.store.DataTransfer(),
				handlers: {
					dragStart: this.__dragStart.bind(this),
					dragEnd: this.__dragEnd.bind(this),
					handleMouseDown: this.__handleMouseDown.bind(this),
					handleMouseUp: this.__handleMouseUp.bind(this)
				}
			};
		}

	},


	getDragTarget: function() {
		return this.el && this.el.dom;
	},


	getDragBoundingClientRect: function() {
		var target = this.getDragTarget();

		return target.getBoundingClientRect();
	},


	__setOrRemoveDragListeners: function(remove) {
		if (!this.rendered) {
			this.on('afterrender', this.__setOrRemoveDragListeners.bind(this, remove));
			return;
		}

		this.initDragging();

		var target = this.getDragTarget(),
			method = remove ? 'removeEventListener' : 'addEventListener',
			handlers = this.Draggable.handlers;

		if (!target || !target[method]) {
			console.error('No Valid Drag Target');
			return;
		}

		if (handlers.dragStart) {
			target[method]('dragstart', handlers.dragStart);
		}

		if (handlers.dragEnd) {
			target[method]('dragend', handlers.dragEnd);
		}

		if (remove) {
			target.removeAttribute('draggable');
		} else {
			target.setAttribute('draggable', 'true');
		}
	},


	__setOrRemoveDragHandleListeners: function(remove) {
		if (!this.rendered) {
			this.on('afterrender', this.__setOrRemoveDragHandleListeners.bind(this, remove));
			return;
		}

		this.initDragging();

		var handle = this.getDragHandle && this.getDragHandle(),
			handlers = this.Draggable.handlers,
			method = remove ? 'removeEventListener' : 'addEventListener';

		if (!handle || !handle[method]) {
			this.Draggable.hasHandle = false;
			return;
		}

		this.Draggable.hasHandle = true;

		if (handlers.handleMouseDown) {
			handle[method]('mousedown', handlers.handleMouseDown);
		}

		if (handlers.handleMouseUp) {
			handle[method]('mouseup', handlers.handleMouseUp);
		}
	},


	/**
	 * Add all the listeners to the target
	 */
	enableDragging: function() {
		this.__setOrRemoveDragListeners();
		this.__setOrRemoveDragHandleListeners();
	},


	/**
	 * Add all the listeners to the target
	 */
	disableDragging: function() {
		this.__setOrRemoveDragListeners(true);
		this.__setOrRemoveDragHandleListeners(true);
	},


	/**
	 * Add values to be set on the dataTransfer object.
	 */
	setDataTransfer: function(key, value) {
		this.initDragging();

		this.Draggable.transferData.setData(key, value);
	},


	getDnDEventData: function() {
		return new NextThought.model.app.DndInfo();
	},


	__handleMouseDown: function() {
		console.log('Mouse down called on: ', this.Draggable.className);
		this.Draggable.inHandle = true;
	},


	__handleMouseUp: function() {
		console.log('Mouse up called on: ', this.Draggable.className);
		this.Draggable.inHandle = false;
	},


	__isValidDrag: function() {
		return !this.Draggable.hasHandle || this.Draggable.inHandle;
	},


	__dragStart: function(e) {
		if (!this.__isValidDrag()) { return; }

		var el = this.getDragTarget(),
			info = this.getDnDEventData();

		if (el) {
			el.classList.add('dragging');
		}

		e.dataTransfer.effectAllowd = 'all';
		e.dataTransfer.setData(info.mimeType, info.getDataTransferValue());

		if (this.Draggable.transferData) {
			this.Draggable.transferData.forEach(function(key, value) {
				e.dataTransfer.setData(key, value);
			});
		}


		if (this.onDragStart) {
			this.onDragStart();
		}
	},

	__dragEnd: function() {
		var el = this.getDragTarget();

		this.Draggable.inHandle = false;

		if (el) {
			el.classList.remove('dragging');
		}


		if (this.onDragEnd) {
			this.onDragEnd();
		}
	}
});
