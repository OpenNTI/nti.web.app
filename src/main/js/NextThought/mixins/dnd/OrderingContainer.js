Ext.define('NextThought.mixins.dnd.OrderingContainer', {

	requires: [
		'NextThought.model.app.MoveInfo'
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


	getInfoForCoordinates: function(x, y) {
		var items = this.getOrderingItems(),
			dropzoneRect = this.getDropzoneBoundingClientRect(),
			dropzoneWidth = dropzoneRect.width,
			info, i, current, previous, height;

		for (i = 0; i < items.length; i++) {
			previous = i >= 0 ? items[i] : null;
			current = items[i];

			if (current.isPointBefore(x, y)) {
				if (!previous) {
					info = {
						index: i,
						type: 'row',
						before: current.getDragTarget()
					};
				} else {

					height = current.isFullWidth(dropzoneWidth) || previous.isFullWidth(dropzoneWidth) ? current.getPlaceholderBeforeHeight() : null;

					info = {
						index: i,
						type: height ? 'column' : 'row',
						height: height,
						before: current.getDragTarget()
					};
				}
			}

			if (info) {
				break;
			}
		}

		if (!info) {
			info = {
				index: Infinity,
				append: true,
				type: 'row'
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


	onDragLeave: function() {
		this.__removeDropPlaceholder();
	},


	__showPlaceholderByInfo: function(placeholder, info) {
		var target = this.getDropzoneTarget();

		if (info.append) {
			target.appendChild(placeholder);
		} else if (info.before) {
			target.insertBefore(placeholder, info.before);
		}

		return placeholder;
	},


	onDragOver: function(e, dataTransfer) {
		if (!this.hasHandlerForDataTransfer(dataTransfer)) {
			this.__removePlaceholder();
			return;
		}

		var info = this.getInfoForCoordinates(e.clientX, e.clientY),
			placeholder = this.__getDropPlaceholder();

		this.__showPlaceholderByInfo(placeholder, info);
	},


	onDragDrop: function(e, dataTransfer) {
		var info = this.getInfoForCoordinates(e.clientX, e.clientY),
			placeholder, minWait = Globals.WAIT_TIMES.SHORT,
			handlers = this.getHandlersForDataTransfer(dataTransfer),
			handler = handlers[0], //TODO: think about what to do if there is more than one
			data = handler && dataTransfer.findDataFor(handler.key),
			moveInfo = dataTransfer.findDataFor(NextThought.model.app.MoveInfo.mimeType);

		if (!info || !handler || !handler.onDrop || !data) { return; }

		placeholder = this.__getSavePlaceholder();
		this.__showPlaceholderByInfo(placeholder, info);
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

				return wait(Globals.LONG);
			})
			.always(this.__removeSavePlaceholder.bind(this));
	}
});
