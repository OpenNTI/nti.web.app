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

	statics: {

		setActiveDragItem: function(activeItem) {
			this.activeDragItem = activeItem;
		},

		onNoDropHandler: function() {
			if (this.activeDragItem) {
				this.activeDragItem.onNoDrop();
			}
		},

		onDropFail: function() {
			if (this.activeDragItem) {
				this.activeDragItem.onNoDrop();
			}
		}
	},


	/**
	 * If we haven't yet, set up the handlers. So we
	 * have the same function to add and remove
	 */
	initDragging: function(data) {
		if (!this.Draggable) {
			this.Draggable = {
				className: this.$className,
				hasHandle: false,
				isEnabled: false,
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


	__addTargetListeners: function() {
		this.initDragging();

		var target = this.getDragTarget(),
			handlers = this.Draggable.handlers;

		if (target && target.addEventListener) {
			target.setAttribute('draggable', 'true');

			if (handlers.dragStart) {
				target.addEventListener('dragstart', handlers.dragStart);
			}

			if (handlers.dragEnd) {
				target.addEventListener('dragend', handlers.dragEnd);
			}
		} else {
			console.error('No valid drag target');
		}
	},


	__removeTargetListeners: function() {
		this.initDragging();

		var target = this.getDragTarget(),
			handlers = this.Draggable.handlers;

		if (target && target.removeEventListener) {
			target.removeAttribute('draggable');

			if (handlers.dragStart) {
				target.removeEventListener('dragstart', handlers.dragStart);
			}

			if (handlers.dragEnd) {
				target.removeEventListener('dragend', handlers.dragEnd);
			}
		} else {
			console.error('No valid drag target');
		}
	},


	__handleMouseDown: function() {
		this.__addTargetListeners();
	},


	__handleMouseUp: function() {
		this.__removeTargetListeners();
	},


	__setOrRemoveDragListeners: function(remove) {
		if (!this.rendered) {
			this.on('afterrender', this.__setOrRemoveDragListeners.bind(this, remove));
			return;
		}

		this.initDragging();

		this.Draggable.isEnabled = !remove;

		var handle = this.getDragHandle && this.getDragHandle(),
			method = remove ? 'removeEventListener' : 'addEventListener',
			handlers = this.Draggable.handlers;

		handle = handle || this.getDragTarget();

		if (handle && handle.addEventListener) {
			this.Draggable.hasHandle = true;

			if (handlers.handleMouseDown) {
				handle[method]('mousedown', handlers.handleMouseDown);
			}

			if (handlers.handleMouseUp) {
				handle[method]('mouseup', handlers.handleMouseUp);
			}
		} else {
			console.error('Invalid drag handle.');
		}
	},


	/**
	 * Add all the listeners to the target
	 */
	enableDragging: function() {
		this.__setOrRemoveDragListeners();
	},


	/**
	 * Add all the listeners to the target
	 */
	disableDragging: function() {
		this.__setOrRemoveDragListeners(true);
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


	__dragStart: function(e) {
		var el = this.getDragTarget(),
			info = this.getDnDEventData();

		if (el) {
			wait(100)
				.then(function() {
					el.classList.add('dragging');
				});
		}

		NextThought.mixins.dnd.Draggable.setActiveDragItem(this);

		e.dataTransfer.effectAllowd = 'all';
		e.dataTransfer.setData(info.mimeType, info.getDataTransferValue());
		this.Draggable.isDragging = true;
		if (this.Draggable.transferData) {
			this.Draggable.transferData.forEach(function(key, value) {
				e.dataTransfer.setData(key, value);
			});
		}


		if (this.onDragStart) {
			this.onDragStart();
		}
	},


	__dragEnd: function(e) {
		var el = this.getDragTarget(),
			handle = this.getDragHandle && this.getDragHandle(),
			dropEffect = e.dataTransfer && e.dataTransfer.dropEffect;

		delete this.Draggable.isDragging;

		if (handle) {
			this.__handleMouseUp();
		}

		if (el && dropEffect === 'none') {
			el.classList.remove('dragging');
		}


		if (this.onDragEnd) {
			this.onDragEnd();
		}
	},


	onNoDrop: function() {
		var el = this.getDragTarget(),
			handle = this.getDragHandle && this.getDragHandle();

		delete this.Draggable.isDragging;

		if (handle) {
			this.__handleMouseUp();
		}

		if (el) {
			el.classList.remove('dragging');
		}
	}
});
