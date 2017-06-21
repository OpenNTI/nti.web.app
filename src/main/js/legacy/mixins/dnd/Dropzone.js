const Ext = require('extjs');

const DndDropzone = require('legacy/app/dnd/Dropzone');


/**
 * Handle adding and removing listeners for dropping actions
 *
 * Things that mixin this in can implement, onDragEnter, onDragLeave, onDragOver, and onDragDrop
 * to add custom handlers
 *
 * It can also implement a getDropTarget method, otherwise this.el.dom will be used
 */
module.exports = exports = Ext.define('NextThought.mixins.dnd.Dropzone', {
	/*
	 * If we haven't yet, set up the dropzone wrapper
	 */
	initDropzone: function () {
		if (!this.Dropzone) {
			this.Dropzone = new DndDropzone({
				getDropzoneTarget: this.getDropzoneTarget.bind(this),
				getDropzoneBoundingClientRect: this.getDropzoneBoundingClientRect.bind(this),
				onDragEnter: this.onDragEnter && this.onDragEnter.bind(this),
				onDragLeave: this.onDragLeave && this.onDragLeave.bind(this),
				onDragOver: this.onDragOver && this.onDragOver.bind(this),
				onDragDrop: this.onDragDrop && this.onDragDrop.bind(this),
				onInvalidDrop: this.onInvalidDrop && this.onInvalidDrop.bind(this),
				onInvalidOver: this.onInvalidOver && this.onInvalidOver.bind(this),
				onDragStart: this.onDragStart && this.onDragStart.bind(this),
				onDragEnd: this.onDragEnd && this.onDragEnd.bind(this)
			});

			this.on('destroy', () => {
				this.Dropzone.destroy();
				delete this.Dropzone;
			});
		}
	},

	getDropzoneTarget: function () {
		return this.el && this.el.dom;
	},

	getDropzoneBoundingClientRect: function () {
		var target = this.getDropzoneTarget(),
			rect;

		if (target) {
			rect = target.getBoundingClientRect();
		} else {
			rect = {top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0};
		}

		return rect;
	},

	/*
	 * Add all the listeners to the target
	 */
	enableDropzone: function () {
		this.initDropzone();

		if (!this.rendered) {
			this.on('afterrender', this.Dropzone.enableDropzone.bind(this.Dropzone));
		} else {
			this.Dropzone.enableDropzone();
		}
	},

	/*
	 * Remove all the listeners on the target
	 */
	disableDropzone: function () {
		this.initDropzone();

		if (!this.rendered) {
			this.on('afterrender', this.Dropzone.disableDropzone.bind(this.Dropzone));
		} else {
			this.Dropzone.disableDropzone();
		}
	},

	/**
	 * Set a data transfer handler on the dropzone wrapper
	 * @param {Strins} key	   key to look up data on
	 * @param {Object} handler the handlers, see NextThought.app.dnd.Dropzone
	 * @returns {void}
	 */
	setDataTransferHandler: function (key, handler) {
		this.initDropzone();

		this.Dropzone.setDataTransferHandler(key, handler);
	},

	getHandlersForDataTransfer: function (dataTransfer) {
		this.initDropzone();

		return this.Dropzone.getHandlersForDataTransfer(dataTransfer);
	},

	hasHandlerForDataTransfer: function (dataTransfer) {
		var handlers = this.getHandlersForDataTransfer(dataTransfer);

		return handlers.length > 0;
	}
});
