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
		'NextThought.model.app.dndInfo'
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


	__getTarget: function() {
		if (this.getDragTarget) {
			return this.getDragTarget();
		}

		return this.el && this.el.dom;
	},


	__setOrRemoveListeners: function(remove) {
		if (!this.rendered) {
			this.on('afterrender', this.__setOrRemoveListeners.bind(this, remove));
			return;
		}

		this.initDragging();

		var target = this.__getTarget(),
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
		this.__setOrRemoveListeners();
	},


	/**
	 * Add all the listeners to the target
	 */
	disableDragging: function() {
		this.__setOrRemoveListeners(true);
	},


	/**
	 * Add values to be set on the dataTransfer object.
	 * The value being stored, will either:
	 *
	 * 1) if it implements getDataForTransfer, store that return value
	 * 2) stringify the value
	 *
	 * If no value is passed assume that the key is the value to store and the key is either:
	 *
	 * 1) if the value implements getKeyForTransfer call it
	 * 2) if the value has a mimeType use it
	 * 3) if the value is a string use it
	 *
	 * If no key is provided or we are unable to find one nothing will be added to the data transfer
	 *
	 * @param {String|Mixed} key   the key to store the value on (typically a mimetype), or the object to store
	 * @param {Mixed} value the value to store
	 */
	setDataTransfer: function(key, value) {
		this.transferData = this.transferData || {};

		if (!value) {
			value = key;
			key = '';

			if (value.getKeyForTransfer) {
				key = value.getKeyForTransfer();
			} else if (value.mimeType) {
				key = value.mimeType;
			} else if (typeof value === 'string') {
				key = value;
			} else {
				console.error('Unable to find key for: ', value);
			}
		}

		if (!key) {
			console.error('No key provided for data transfer');
			return;
		}

		if (this.transferData[key]) {
			console.warn('Overriding transfer data: ', key, ' from ', this.transferData[key], ' with ', value);
		}

		if (value.getDataTransferValue) {
			value = value.getDataTransferValue();
		} else {
			value = JSON.stringify(value);
		}

		this.transferData[key] = value;
	},


	getDnDEventData: function() {
		return new NextThought.model.app.dndInfo();
	},


	__dragStart: function(e) {
		var el = this.__getTarget(),
			info = this.getDnDEventData(),
			transferData = this.transferData,
			keys = Object.keys(transferData);

		if (el) {
			el.classList.add('dragging');
		}

		e.dataTransfer.setData(info.mimeType, info.getDataTransferValue());

		keys.forEach(function(key) {
			e.dataTransfer.setData(key, transferData[key]);
		});

		if (this.onDragStart) {
			this.onDragStart();
		}
	},

	__dragEnd: function() {
		var el = this.__getTarget();

		if (el) {
			el.classList.remove('dragging');
		}

		if (this.onDragEnd) {
			this.onDragEnd();
		}
	}
});
