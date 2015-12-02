/**
 * Handle adding and removing listeners for dropping actions
 *
 * Things that mixin this in can implement, onDragEnter, onDragLeave, onDragOver, and onDragDrop
 * to add custom handlers
 *
 * It can also implement a getDropTarget method, otherwise this.el.dom will be used
 */
Ext.define('NextThought.mixins.dnd.Dropzone', {

	requires: [
		'NextThought.model.app.dndInfo',
		'NextThought.store.DataTransfer'
	],


	/**
	 * If we haven't yet, set up the handlers. So we
	 * have the same function to add and remove
	 */
	initDropzone: function() {
		if (!this.DropzoneHandlers) {
			this.DropzoneHandlers = {
				dragEnter: this.__dragEnter.bind(this),
				dragLeave: this.__dragLeave.bind(this),
				dragOver: this.__dragOver.bind(this),
				drop: this.__dragDrop.bind(this)
			};
		}
	},


	__setOrRemoveDropListeners: function(remove) {
		if (!this.rendered) {
			this.on('afterrender', this.__setOrRemoveDropListeners.bind(this, remove));
			return;
		}

		this.initDropzone();

		var target = this.getDropzoneTarget(),
			method = remove ? 'removeEventListener' : 'addEventListener',
			handlers = this.DropzoneHandlers;

		if (!target || !target[method]) {
			console.error('No Valid Drag Target');
			return;
		}

		if (handlers.dragEnter) {
			target[method]('dragenter', handlers.dragEnter);
		}

		if (handlers.dragLeave) {
			target[method]('dragleave', handlers.dragLeave);
		}

		if (handlers.dragOver) {
			target[method]('dragover', handlers.dragOver);
		}

		if (handlers.drop) {
			target[method]('drop', handlers.drop);
		}
	},

	/**
	 * Add all the listeners to the target
	 */
	enableDropzone: function() {
		this.__setOrRemoveDropListeners();
	},


	/**
	 * Remove all the listeners on the target
	 */
	disableDropzone: function() {
		this.__setOrRemoveDropListeners(true);
	},


	/**
	 * Add a method to be called when there is a drop event with
	 * dataTransfer for the key.
	 *
	 * NOTE: the data from the event will only be available in the same
	 * event pump as the handler
	 *
	 * @param {String}   key the key to look in the data transfer for
	 * @param {Function} fn  the method to call with the data
	 */
	setDataTransferHandler: function(key, fn) {
		this.transferHandlers = this.transferHandlers || {};

		if (this.transferHandlers[key]) {
			console.warn('Overriding transfer handler: ', key);
		}

		this.transferHandlers[key] = fn;
	},


	getDropzoneTarget: function() {
		return this.el && this.el.dom;
	},


	getDropzoneBoundingClientRect: function() {
		var target = this.getDropzoneTarget();

		return target.getBoundingClientRect();
	},


	__dragEnter: function(e) {
		var el = this.getDropzoneTarget();

		this.dragEnterCounter = this.dragEnterCounter || 0;

		this.dragEnterCounter += 1;

		if (el) {
			el.classList.add('drag-over');
		}

		if (this.onDragEnter) {
			this.onDragEnter(e);
		}
	},


	__dragLeave: function(e) {
		var el = this.getDropzoneTarget();

		this.dragEnterCounter = this.dragEnterCounter || 1;

		this.dragEnterCounter -= 1;

		if (this.dragEnterCounter === 0) {
			if (el) {
				el.classList.remove('drag-over');
			}

			if (this.onDragLeave) {
				this.onDragLeave(e);
			}
		}
	},


	__dragOver: function(e) {
		e.preventDefault();
		e.stopPropagation();

		var dataTransfer = new NextThought.store.DataTransfer({dataTransfer: e.dataTransfer});

		if (!dataTransfer.containsType(NextThought.model.app.dndInfo.mimeType)) {
			console.warn('Invalid drop event: ', e);
		} else if (this.onDragOver) {
			this.onDragOver(e, dataTransfer);
		}
	},


	__dragDrop: function(e) {
		e.preventDefault();
		e.stopPropagation();

		var dataTransfer = new NextThought.store.DataTransfer({dataTransfer: e.dataTransfer});

		if (this.__isValidDrop(dataTransfer.getData(NextThought.model.app.dndInfo.mimeType))) {
			console.warn('Invalid drop event: ', e);
		} else if (this.onDragDrop) {
			this.onDragDrop(e, dataTransfer);
		} else {
			this.__callHandlers(e, dataTransfer);
		}
	},


	hasHandlerForDataTransfer: function(dataTransfer) {
		var handlers = this.transferHandlers,
			keys = handlers && Object.keys(handlers),
			i;

		keys = keys || [];

		for (i = 0; i < keys.length; i++) {
			if (dataTransfer.containsType(keys[i])) {
				return true;
			}
		}

		return false;
	},


	__isValidDrop: function(dndInfo) {
		return !!dndInfo; //For now its a valid drop if we have NT drop info
	},


	__callHandlers: function(e, dataTransfer) {
		var handlers = this.transferHandlers || {},
			keys = Object.keys(handlers);

		keys.forEach(function(key) {
			var data = dataTransfer.getModel() || dataTransfer.getJSON() || dataTransfer.getData();

			if (data) {
				handlers[key](data, dataTransfer, e);
			}
		});
	}
});
