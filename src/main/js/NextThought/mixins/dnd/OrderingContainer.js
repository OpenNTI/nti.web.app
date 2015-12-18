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


	__getPlacholder: function() {
		var placeholder = document.querySelector('.dnd-drop-placeholder');

		if (!placeholder) {
			placeholder = document.createElement('div');
			placeholder.style.height = '2px';
			placeholder.style.background = 'black';
			placeholder.classList.add('dnd-drop-placeholder');
		}

		return placeholder;
	},

	__removePlaceholder: function() {
		var placeholder = document.querySelector('.dnd-drop-placeholder');

		if (placeholder) {
			placeholder.remove();
		}
	},


	onItemDragStart: function() {
		this.__getPlacholder();
	},


	onItemDragEnd: function() {
		this.__removePlaceholder();
	},


	onDragLeave: function() {
		this.__removePlaceholder();
	},


	onDragOver: function(e, dataTransfer) {
		if (!this.hasHandlerForDataTransfer(dataTransfer)) {
			this.__removePlaceholder();
			return;
		}

		var target = this.getDropzoneTarget(),
			placeholder = this.__getPlacholder(),
			info = this.getInfoForCoordinates(e.clientX, e.clientY);

		if (info.append) {
			target.appendChild(placeholder);
		} else if (info.before) {
			target.insertBefore(placeholder, info.before);
		}
	},


	onDragDrop: function(e, dataTransfer) {
		var info = this.getInfoForCoordinates(e.clientX, e.clientY),
			handlers = this.getHandlersForDataTransfer(dataTransfer),
			handler = handlers[0], //TODO: think about what to do if there is more than one
			data = handler && dataTransfer.findDataFor(handler.key),
			moveInfo = dataTransfer.findDataFor(NextThought.model.app.MoveInfo.mimeType);

		if (info && handler && handler.onDrop && data) {
			handler.onDrop(data, info.index, moveInfo);
		}
	}
});
