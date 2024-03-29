const Ext = require('@nti/extjs');
const Scrolling = require('internal/legacy/util/Scrolling');
const DndInfo = require('internal/legacy/model/app/DndInfo');
const DataTransferStore = require('internal/legacy/store/DataTransfer');

const StateStore = require('./StateStore');

require('internal/legacy/mixins/Scrolling');

module.exports = exports = Ext.define('NextThought.app.dnd.Dropzone', {
	mixins: {
		Scrolling: 'NextThought.mixins.Scrolling',
		observable: 'Ext.util.Observable',
	},

	constructor: function (config) {
		this.mixins.observable.constructor.call(this, config);

		this.DnDStore = StateStore.getInstance();

		if (config.getDropzoneTarget) {
			this.getDropzoneTarget = config.getDropzoneTarget;
		} else {
			throw new Error('No getDropzoneTarget passed!');
		}

		this.onDragEnter = config.onDragEnter;
		this.onDragLeave = config.onDragLeave;
		this.onDragOver = config.onDragOver;
		this.onDragDrop = config.onDragDrop;
		this.onInvalidDrop = config.onInvalidDrop;
		this.onInvalidOver = config.onInvalidOver;
		this.onDragStart = config.onDragStart;
		this.onDragEnd = config.onDragEnd;

		this.handlers = {
			dragEnter: this.__dragEnter.bind(this),
			dragLeave: this.__dragLeave.bind(this),
			dragOver: this.__dragOver.bind(this),
			drop: this.__dragDrop.bind(this),
		};

		this.transferHandlers = {};

		this.mon(this.DnDStore, {
			'drag-start': this.__onDragStart.bind(this),
			'drag-end': this.__onDragEnd.bind(this),
		});
	},

	__setOrRemoveDropListeners: function (remove) {
		this.isEnabled = !remove;

		var target = this.getDropzoneTarget(),
			method = remove ? 'removeEventListener' : 'addEventListener',
			handlers = this.handlers;

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

	enableDropzone: function () {
		this.__setOrRemoveDropListeners();
	},

	disableDropzone: function () {
		this.__setOrRemoveDropListeners(true);
	},

	/**
	 * The handler is be a group of functions that looks like:
	 *
	 * {
	 *	onDrop: fn, //call to handle the drop event
	 *	isValid: fn, //returns a boolean value, if the given data transfer is valid
	 *	effect: String //returns a string of the drop effect to use (copy, move, link, copyMove, copyLink, linkMove, all)
	 * }
	 *
	 * NOTE: the data from the event will only be available in the same
	 * event pump as the handler
	 *
	 * @param {string} key the key to look in the data transfer for
	 * @param {Object} handler  the methods
	 * @returns {void}
	 */
	setDataTransferHandler: function (key, handler) {
		if (this.transferHandlers[key]) {
			console.warn('Overriding transfer handler: ', key);
		}

		handler.key = key;
		this.transferHandlers[key] = handler;
	},

	getHandlersForDataTransfer: function (dataTransfer) {
		const handlers = this.transferHandlers;
		const keys = handlers && Object.keys(handlers);

		const cacheKey = keys.join(',');
		const cache = this.dthCache || (this.dthCache = {});

		return (
			cache[cacheKey] ||
			(cache[cacheKey] =
				(console.log('Calculating Handlers....'),
				keys.reduce(function (acc, key) {
					var handler = handlers[key];

					//If there is no data for this handler
					if (!dataTransfer.containsType(key)) {
						return acc;
					}

					if (!handler.isValid || handler.isValid(dataTransfer)) {
						acc.push(handler);
					}

					return acc;
				}, [])))
		);
	},

	__onDragStart: function () {
		var scrollingParent = this.findScrollableParent(
			this.getDropzoneTarget()
		);

		if (scrollingParent) {
			this.scrollingParent = new Scrolling({ el: scrollingParent });
			this.scrollingParent.scrollWhenDragNearEdges();
		}

		if (this.onDragStart) {
			this.onDragStart();
		}
	},

	__onDragEnd: function () {
		delete this.dthCache;
		if (this.scrollingParent) {
			this.scrollingParent.unscrollWhenDragNearEdges();
		}

		if (this.onDragEnd) {
			this.onDragEnd();
		}
	},

	__isValidTransfer: function (dataTransfer) {
		return !!dataTransfer.containsType(DndInfo.mimeType);
	},

	__isValidDrop: function (dataTransfer) {
		var dndInfo = dataTransfer.getData(DndInfo.mimeType);

		return !!dndInfo; //TODO: maybe check the source and version number
	},

	__getEffectForHandlers: function (handlers) {
		var effect,
			handler,
			i = 0;

		handler = handlers[i];

		while (!effect && handler) {
			effect = handler.effect;
			i += 1;
			handler = handlers[i];
		}

		return effect;
	},

	__dragEnter: function (e) {
		e.preventDefault();
		e.stopPropagation();

		if (!e.dataTransfer) {
			return;
		}

		var el = this.getDropzoneTarget(),
			dataTransfer = new DataTransferStore({
				dataTransfer: e.dataTransfer,
			}),
			handlers = this.getHandlersForDataTransfer(dataTransfer);

		this.dragEnterCounter = this.__makePositiveOrZero(
			this.dragEnterCounter,
			0
		);

		this.dragEnterCounter += 1;

		if (handlers.length > 0 && this.__isValidTransfer(dataTransfer)) {
			if (el) {
				el.classList.add('drag-over');
			}

			if (this.onDragEnter) {
				this.onDragEnter(e);
			}
		}
	},

	__dragLeave: function (e) {
		e.preventDefault();
		e.stopPropagation();

		var el = this.getDropzoneTarget();

		this.dragEnterCounter = this.__makePositiveOrZero(
			this.dragEnterCounter,
			1
		);

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

	__dragOver: function (e) {
		e.preventDefault();
		e.stopPropagation();

		if (!e.dataTransfer) {
			return;
		}

		var dataTransfer = new DataTransferStore({
				dataTransfer: e.dataTransfer,
			}),
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

	__dragDrop: function (e) {
		e.preventDefault();
		e.stopPropagation();

		var dataTransfer = new DataTransferStore({
			dataTransfer: e.dataTransfer,
		});

		if (this.scrollingParent) {
			this.scrollingParent.unscrollWhenDragNearEdges();
		}

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

	__callHandlers: function (e, dataTransfer) {
		var handlers = this.transferHandlers || {},
			keys = Object.keys(handlers);

		//TODO: look at that to do when there is more than one handler for a drop...
		keys.forEach(function (key) {
			var data =
				dataTransfer.getModel(key) ||
				dataTransfer.getJSON(key) ||
				dataTransfer.getData(key);

			if (data) {
				handlers[key](data, dataTransfer, e);
			}
		});
	},

	__makePositiveOrZero: function (value, defaultValue) {
		value = value ?? defaultValue;
		return value < 0 ? defaultValue : value;
	},
});
