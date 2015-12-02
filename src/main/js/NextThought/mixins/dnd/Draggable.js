/**
 * Handle adding and removing listeners for dropping actions
 *
 * Things that mixin this in can implement, onDragStart and onDragEnd
 * to add custom handlers
 *
 * It can also implement a getDragTarget method, otherwise this.el.dom will be used
 */
Ext.define('NextThought.mixins.dnd.Draggable', {

	requires: [
		'NextThought.model.app.dndInfo',
		'NextThought.store.DataTransfer'
	],

	/**
	 * If we haven't yet, set up the handlers. So we
	 * have the same function to add and remove
	 */
	initDragging: function(data) {
		if (!this.DragHandlers) {
			this.DragHandlers = {
				dragStart: this.__dragStart.bind(this),
				dragEnd: this.__dragEnd.bind(this)
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
			handlers = this.DragHandlers;

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
		this.transferData = this.transferData || new NextThought.store.DataTransfer();

		this.transferData.setData(key, value);
	},


	getDnDEventData: function() {
		return new NextThought.model.app.dndInfo();
	},


	__dragStart: function(e) {
		var el = this.getDragTarget(),
			info = this.getDnDEventData();

		if (el) {
			el.classList.add('dragging');
		}

		e.dataTransfer.setData(info.mimeType, info.getDataTransferValue());

		if (this.transferData) {
			this.transferData.forEach(function(key, value) {
				e.dataTransfer.setData(key, value);
			});
		}

		if (this.onDragStart) {
			this.onDragStart();
		}
	},

	__dragEnd: function() {
		var el = this.getDragTarget();

		if (el) {
			el.classList.remove('dragging');
		}

		if (this.onDragEnd) {
			this.onDragEnd();
		}
	}
});
