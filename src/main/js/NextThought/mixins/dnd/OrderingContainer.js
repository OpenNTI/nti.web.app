Ext.define('NextThought.mixins.dnd.OrderingContainer', {
	mixins: {
		Dropzone: 'NextThought.mixins.dnd.Dropzone'
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
			info, i, current, previous;

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
					info = {
						index: i,
						type: current.isFullWidth(dropzoneWidth) || previous.isFullWidth(dropzoneWidth) ? 'row' : 'column',
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
	}
});
