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
		'NextThought.model.app.dndInfo'
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


	__setOrRemoveListeners: function(remove) {
		if (!this.rendered) {
			this.on('afterrender', this.__setOrRemoveListeners.bind(this, remove));
			return;
		}

		this.initDropzone();

		var target = this.__getTarget(),
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
		this.__setOrRemoveListeners();
	},


	/**
	 * Remove all the listeners on the target
	 */
	disableDropzone: function() {
		this.__setOrRemoveListeners(true);
	},


	/**
	 * Add a method to be called when there is a drop event with
	 * dataTransfer for the key
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


	__getTarget: function() {
		if (this.getDropzoneTarget) {
			return this.getDropzoneTarget();
		}

		return this.el && this.el.dom;
	},


	__dragEnter: function() {
		var el = this.__getTarget();

		if (el) {
			el.classList.add('drag-over');
		}

		if (this.onDragEnter) {
			this.onDragEnter(e);
		}
	},


	__dragLeave: function() {
		var el = this.__getTarget();

		if (el) {
			el.classList.remove('drag-over');
		}

		if (this.onDragLeave) {
			this.onDragLeave(e);
		}
	},


	__dragOver: function(e) {
		e.preventDefault();

		if (this.onDragOver) {
			this.onDragOver(e);
		}
	},


	__dragDrop: function(e) {
		e.preventDefault();

		if (this.onDragDrop) {
			this.onDragDrop(e);
		}
	}
});
