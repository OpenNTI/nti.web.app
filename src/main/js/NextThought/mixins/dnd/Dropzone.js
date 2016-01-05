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
		'NextThought.model.app.DndInfo',
		'NextThought.store.DataTransfer'
	],


	/**
	 * If we haven't yet, set up the handlers. So we
	 * have the same function to add and remove
	 */
	initDropzone: function() {
		if (!this.Dropzone) {
			this.Dropzone = {
				transferHandlers: {},
				handlers: {
					dragEnter: this.__dragEnter.bind(this),
					dragLeave: this.__dragLeave.bind(this),
					dragOver: this.__dragOver.bind(this),
					drop: this.__dragDrop.bind(this)
				}
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
			handlers = this.Dropzone.handlers;

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
	 * The handler is be a group of functions that looks like:
	 *
	 * {
	 * 	onDrop: fn, //call to handle the drop event
	 * 	isValid: fn, //returns a boolean value, if the given data transfer is valid
	 * 	effect: String //returns a string of the drop effect to use (copy, move, link, copyMove, copyLink, linkMove, all)
	 * }
	 *
	 * NOTE: the data from the event will only be available in the same
	 * event pump as the handler
	 *
	 * @param {String}   key the key to look in the data transfer for
	 * @param {Object} fn  the methods
	 */
	setDataTransferHandler: function(key, handler) {
		this.initDropzone();

		if (this.Dropzone.transferHandlers[key]) {
			console.warn('Overriding transfer handler: ', key);
		}

		handler.key = key;
		this.Dropzone.transferHandlers[key] = handler;
	},


	getDropzoneTarget: function() {
		return this.el && this.el.dom;
	},


	getDropzoneBoundingClientRect: function() {
		var target = this.getDropzoneTarget();

		return target.getBoundingClientRect();
	},


	__dragEnter: function(e) {
		var el = this.getDropzoneTarget(),
			dataTransfer = new NextThought.store.DataTransfer({dataTransfer: e.dataTransfer}),
			handlers = this.getHandlersForDataTransfer(dataTransfer),
			effect, handler;

		handler = handlers[0];

		//Get the first handler to have an effect defined
		while (!effect && handler) {
			effect = handler.effect;
		}

		if (effect) {
			e.dataTransfer.dropEffect = effect;
		}

		this.Dropzone.dragEnterCounter = this.Dropzone.dragEnterCounter || 0;

		this.Dropzone.dragEnterCounter += 1;

		if (handlers.length > 0 && this.__isValidTransfer(dataTransfer)) {
			if (el) {
				el.classList.add('drag-over');
			}

			if (this.onDragEnter) {
				this.onDragEnter(e);
			}
		}
	},


	__dragLeave: function(e) {
		var el = this.getDropzoneTarget();

		this.Dropzone.dragEnterCounter = this.Dropzone.dragEnterCounter || 1;

		this.Dropzone.dragEnterCounter -= 1;

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

		var dataTransfer = new NextThought.store.DataTransfer({dataTransfer: e.dataTransfer}),
			handlers = this.getHandlersForDataTransfer(dataTransfer);

		if (!this.__isValidTransfer(dataTransfer)) {
			if (this.onInvalidOver) {
				this.onInvalidOver();
			}
		} else if (handlers.length === 0) {
			if (this.onNoHandlers) {
				this.onNoHandlers();
			}
		} else if (this.onDragOver) {
			this.onDragOver(e, dataTransfer);
		}
	},


	__dragDrop: function(e) {
		e.preventDefault();
		e.stopPropagation();

		var dataTransfer = new NextThought.store.DataTransfer({dataTransfer: e.dataTransfer});

		if (!this.__isValidDrop(dataTransfer)) {
			if (this.onInvalidDrop) {
				this.onInvalidDrop();
			}
		} else if (this.onDragDrop) {
			this.onDragDrop(e, dataTransfer);
		} else {
			this.__callHandlers(e, dataTransfer);
		}
	},


	getHandlersForDataTransfer: function(dataTransfer) {
		var handlers = this.Dropzone.transferHandlers,
			keys = handlers && Object.keys(handlers);

		return keys.reduce(function(acc, key) {
			var handler = handlers[key];

			//If there is no data for this handler
			if (!dataTransfer.containsType(key)) { return acc; }

			if (!handler.isValid || handler.isValid(dataTransfer)) {
				acc.push(handler);
			}

			return acc;
		}, []);
	},


	hasHandlerForDataTransfer: function(dataTransfer) {
		var handlers = this.getHandlersForDataTransfer(dataTransfer);

		return handlers.length > 0;
	},


	__isValidTransfer: function(dataTransfer) {
		return !!dataTransfer.containsType(NextThought.model.app.DndInfo.mimeType);
	},


	__isValidDrop: function(dataTransfer) {
		var dndInfo = dataTransfer.getData(NextThought.model.app.DndInfo.mimeType);

		return !!dndInfo;//TODO: maybe check the source and version number
	},


	__callHandlers: function(e, dataTransfer) {
		var handlers = this.transferHandlers || {},
			keys = Object.keys(handlers);

		//TODO: look at that to do when there is more than one handler for a drop...
		keys.forEach(function(key) {
			var data = dataTransfer.getModel(key) || dataTransfer.getJSON(key) || dataTransfer.getData(key);

			if (data) {
				handlers[key](data, dataTransfer, e);
			}
		});
	}
});
