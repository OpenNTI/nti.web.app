Ext.define('NextThought.mixins.dnd.OrderingContainer', {

	requires: [
		'NextThought.model.app.MoveInfo',
		'NextThought.app.dnd.Actions'
	],


	mixins: {
		Dropzone: 'NextThought.mixins.dnd.Dropzone'
	},


	statics: {
		hasMoveInfo: function(dataTransfer) {
			return dataTransfer.containsType(NextThought.model.app.MoveInfo.mimeType);
		}
	},


	initOrdering: function() {
	},


	enableOrderingContainer: function() {
		this.enableDropzone();

		var items = this.getOrderingItems();

		items.forEach(this.enableDraggingOnItem.bind(this));
	},


	disableOrderingContainer: function() {
		this.disableDropzone();

		var items = this.getOrderingItems();

		items.forEach(this.disableDraggingOnItem.bind(this));
	},


	getOrderingItems: function() {
		return [];
	},


	enableDraggingOnItem: function(item, index) {
		if (item && item.enableOrdering) {
			item.enableOrdering(index, this.onItemDragStart.bind(this), this.onItemDragEnd.bind(this));
		}
	},


	disableDraggingOnItem: function(item) {
		if (item && item.disableOrdering) {
			item.disableOrdering();
		}
	},


	getInfoForCoordinates: function(x, y, styles) {
		var items = this.getOrderingItems(),
			dropzoneRect = this.getDropzoneBoundingClientRect(),
			dropzoneWidth = dropzoneRect.width,
			info, i, current, previous, isBefore;

		x = x - dropzoneRect.left;
		y = y - dropzoneRect.top;

		items = items.filter(function(item) {
			return (!item.Draggable || !item.Draggable.isDragging) && item.isOrderingItem;
		});

		for (i = 0; i < items.length; i++) {
			previous = items[i - 1];
			current = items[i];

			if (styles && styles.side) {
				if (current.isFullWidth(dropzoneWidth)) {
					isBefore = current.isPointAbove(x, y);
				} else {
					isBefore = current.isPointLeft(x, y);
				}
			} else {
				if (current.isPointContainedVertically(x, y) && !current.isFullWidth(dropzoneWidth)) {
					isBefore = current.isPointLeft(x, y);
				} else {
					isBefore = current.isPointBefore(x, y);
				}
			}

			if (isBefore) {
				info = {
					index: 1,
					before: current.getDragTarget()
				};
			}

			if (info) {
				break;
			}
		}

		if (!info) {
			info = {
				index: items.length,
				append: true
			};
		}


		return info;
	},


	__getDropPlaceholder: function() {
		var placeholder = document.querySelector('.dnd-drop-placeholder');

		if (!placeholder) {
			placeholder = document.createElement('div');
			placeholder.classList.add('dnd-drop-placeholder');
		}

		return placeholder;
	},

	__removeDropPlaceholder: function() {
		var placeholder = document.querySelector('.dnd-drop-placeholder');

		if (placeholder) {
			placeholder.remove();
		}
	},


	__getSavePlaceholder: function() {
		var placeholder = document.querySelector('.dnd-save-placeholder');

		if (!placeholder) {
			placeholder = document.createElement('div');
			placeholder.classList.add('dnd-save-placeholder');
			placeholder.innerHTML = '<span>Saving</span>';
		}

		return placeholder;
	},


	__removeSavePlaceholder: function() {
		var placeholder = document.querySelector('.dnd-save-placeholder');

		if (placeholder) {
			placeholder.remove();
		}
	},


	onItemDragStart: function() {
		this.__getDropPlaceholder();
	},


	onItemDragEnd: function() {
		this.__removeDropPlaceholder();
	},


	onDragStart: function() {
		var items = this.getOrderingItems(),
			rect = this.getDropzoneBoundingClientRect();

		items.forEach(function(item) {
			if (item.lockRectRelative) {
				item.lockRectRelative(rect);
			}
		});
	},


	onDragEnd: function() {
		var items = this.getOrderingItems();

		items.forEach(function(item) {
			if (item.unlockRect) {
				item.unlockRect();
			}
		});
	},


	onDragLeave: function() {
		this.__removeDropPlaceholder();
	},


	__showPlaceholderByInfo: function(placeholder, info, styles) {
		var target = this.getDropzoneTarget();

		if (info.append) {
			target.appendChild(placeholder);
		} else if (info.before) {
			target.insertBefore(placeholder, info.before);
		}

		if (styles) {
			placeholder.style.height = styles.height ? styles.height + 'px' : null;
			placeholder.style.width = styles.width ? styles.width + 'px' : null;
			placeholder.style['float'] = styles.side ? styles.side : null;

			if (styles.side) {
				placeholder.classList.add('column');
			} else {
				placeholder.classList.remove('column');
			}
		}

		return placeholder;
	},


	onDragOver: function(e, dataTransfer) {
		if (!this.hasHandlerForDataTransfer(dataTransfer)) {
			this.__removePlaceholder();
			return;

		}

		var dndActions = NextThought.app.dnd.Actions.create(),
			placeholderStyles = dndActions.getPlaceholderStyles(),
			info = this.getInfoForCoordinates(e.clientX, e.clientY, placeholderStyles),
			placeholder = this.__getDropPlaceholder();


		this.__showPlaceholderByInfo(placeholder, info, placeholderStyles);
	},


	onDragDrop: function(e, dataTransfer) {
		var dndActions = NextThought.app.dnd.Actions.create(),
			placeholderStyles = dndActions.getPlaceholderStyles(),
			info = this.getInfoForCoordinates(e.clientX, e.clientY, placeholderStyles),
			handlers = this.getHandlersForDataTransfer(dataTransfer),
			handler = handlers[0], //TODO: think about what to do if there is more than one
			data = handler && dataTransfer.findDataFor(handler.key),
			moveInfo = dataTransfer.findDataFor(NextThought.model.app.MoveInfo.mimeType),
			move, placeholder, minWait = Globals.WAIT_TIMES.SHORT;

		if (!info || !handler || !handler.onDrop || !data) {
			dndActions.onNoDropHandler();
			this.__removeDropPlaceholder();
			return;
		}

		placeholder = this.__getSavePlaceholder();
		this.__showPlaceholderByInfo(placeholder, info, placeholderStyles);
		this.__removeDropPlaceholder();

		move = handler.onDrop(data, info.index, moveInfo);

		if (!(move instanceof Promise)) {
			move = wait(minWait)
				.then(function() {
					return move;
				});
		}

		move
			.fail(function(reason) {
				console.error('Failed to move: ', reason);

				placeholder.innerHTML = '<span>Error</span>';
				placeholder.classList.add('error');

				dndActions.onDropFail();

				return wait(Globals.LONG);
			})
			.always(this.__removeSavePlaceholder.bind(this));
	}
});
