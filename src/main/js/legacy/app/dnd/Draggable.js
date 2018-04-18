const Ext = require('extjs');
const {wait} = require('@nti/lib-commons');

const DndInfo = require('legacy/model/app/DndInfo');
const DataTransferStore = require('legacy/store/DataTransfer');

const DndActions = require('./Actions');



module.exports = exports = Ext.define('NextThought.app.dnd.Draggable', {
	constructor: function (config) {

		if (config.getDragTarget) {
			this.getDragTarget = config.getDragTarget;
		} else {
			throw new Error('No getDragTarget passed!');
		}

		this.getDragBoundingClientRect = config.getDragBoundingClientRect;

		this.getDragHandle = config.getDragHandle;
		this.onDragStart = config.onDragStart;
		this.onDragEnd = config.onDragEnd;

		this.dropPlaceholderStyles = config.dropPlaceholderStyles;
		this.ghostImageScale = config.ghostImageScale !== undefined ? config.ghostImageScale : 1;

		this.transferData = new DataTransferStore();

		this.handlers = {
			dragStart: this.__dragStart.bind(this),
			dragEnd: this.__dragEnd.bind(this),
			handleMouseDown: this.__handleMouseDown.bind(this),
			handleMouseUp: this.__handleMouseUp.bind(this)
		};

		this.DnDActions = DndActions.create();
	},

	__addTargetListeners: function () {
		var target = this.getDragTarget(),
			handlers = this.handlers;

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

	__removeTargetListeners: function () {
		var target = this.getDragTarget(),
			handlers = this.handlers;

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

	__handleMouseDown: function () {
		this.__addTargetListeners();
	},

	__handleMouseUp: function () {
		this.__removeTargetListeners();
	},

	__setOrRemoveDragListeners: function (remove) {
		//if we've already added the listeners and are trying
		//to add them twice, don't
		if (this.isEnabled === !remove) {
			return;
		}

		var handle = this.getDragHandle && this.getDragHandle(),
			method = remove ? 'removeEventListener' : 'addEventListener',
			handlers = this.handlers;

		handle = handle || this.getDragTarget();

		if (handle && handle[method]) {
			this.hasHandle = true;

			if (handlers.handleMouseDown) {
				handle[method]('mousedown', handlers.handleMouseDown);
			}

			if (handlers.handleMouseUp) {
				handle[method]('mouseup', handlers.handleMouseUp);
			}
		} else {
			console.error('Invalid drag handle.');
		}

		this.isEnabled = !remove;
	},

	enableDragging: function () {
		this.__setOrRemoveDragListeners();
	},

	disableDragging: function () {
		this.__setOrRemoveDragListeners(true);
	},

	setDataTransfer: function (key, value) {
		this.transferData.setData(key, value);
	},

	getDnDEventData: function () {
		return new DndInfo();
	},

	getPlaceholderStyles: function () {
		var styles = this.dropPlaceholderStyles || {},
			rect = this.getDragBoundingClientRect && this.getDragBoundingClientRect();

		if (rect) {
			styles.width = styles.width || (rect.width * this.ghostImageScale);
			styles.height = styles.height || (rect.height * this.ghostImageScale);
		}

		return styles;
	},

	__dragStart: function (e) {
		var el = this.getDragTarget(),
			info = this.getDnDEventData();

		if (el) {
			wait(100)
				.then(function () {
					el.classList.add('dragging');
				});
		}

		this.DnDActions.startDrag(this);

		e.dataTransfer.effectAllowed = 'all';
		e.dataTransfer.dropEffect = 'move';
		e.dataTransfer.setData(info.mimeType, info.getDataTransferValue());

		this.isDragging = true;

		if (this.transferData) {
			this.transferData.forEach(function (key, value) {
				e.dataTransfer.setData(key, value);
			});
		}

		if (this.onDragStart) {
			this.onDragStart();
		}
	},

	__dragEnd: function (e) {
		var el = this.getDragTarget(),
			handle = this.getDragHandle && this.getDragHandle(),
			dropEffect = e.dataTransfer && e.dataTransfer.dropEffect;

		this.DnDActions.endDrag(this);

		delete this.isDragging;

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

	onNoDrop: function () {
		var el = this.getDragTarget(),
			handle = this.getDragHandle && this.getDragHandle();

		delete this.isDragging;

		this.DnDActions.endDrag(this);

		if (handle) {
			this.__handleMouseUp();
		}

		if (el) {
			el.classList.remove('dragging');
		}
	}
});
