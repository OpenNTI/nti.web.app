Ext.define('NextThought.mixins.dnd.Dropzone', {

	initDropzone: function() {
		if (!this.DropzoneHandlers) {
			this.DropzoneHandlers = {
				dragEnter: this.onDragEnter.bind(this),
				dropLeave: this.onDragLeave.bind(this),
				dragOver: this.onDragOver.bind(this),
				drop: this.onDragDrop.bind(this)
			};
		}
	},


	getDropzoneTarget: function() {
		return this.el && this.el.dom;
	},

	__setOrRemoveListeners: function(remove) {
		if (!this.rendered) {
			this.on('afterrender', this.__setOrRemoveListeners.bind(this, remove));
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

		target[method]('dragenter', handlers.dragEnter);
		target[method]('dragleave', handlers.dragLeave);
		target[method]('dragover', handlers.dragOver);
		target[method]('drop', handlers.drop);
	},


	enableDropzone: function() {
		this.__setOrRemoveListeners();
	},


	disableDropzone: function() {
		this.__setOrRemoveListeners(true);
	},


	onDragEnter: function() {},
	onDragLeave: function() {},
	onDragOver: function() {},
	onDragDrop: function() {}
});
