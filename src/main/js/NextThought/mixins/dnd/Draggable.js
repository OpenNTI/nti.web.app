Ext.define('NextThought.mixins.dnd.Draggable', {

	requires: [
		'NextThought.model.app.dndInfo'
	],

	initDragging: function(data) {
		if (!this.DragHandlers) {
			this.DragHandlers = {
				dragStart: this.onDragStart.bind(this),
				dragEnd: this.onDragEnd.bind(this)
			};
		}
	},


	getDragTarget: function() {
		return this.el && this.el.dom;
	},


	__setOrRemoveListeners: function(remove) {
		if (!this.rendered) {
			this.on('afterrender', this.__setOrRemoveListeners.bind(this, remove));
			return;
		}

		this.initDragging();

		var target = this.getDragTarget(),
			method = remove ? 'removeEventListener' : 'addEventListener',
			handlers = this.DragHandlers;

		if (!target || !target[method]) {
			console.error('No Valid Drag Target');
			return;
		}

		target[method]('dragstart', handlers.dragStart);
		target[method]('dragend', handlers.dragEnd);

		if (remove) {
			target.removeAttribute('draggable');
		} else {
			target.setAttribute('draggable', 'true');
		}
	},


	enableDragging: function() {
		this.__setOrRemoveListeners();
	},


	disableDragging: function() {
		this.__setOrRemoveListeners(true);
	},


	setDataTransfer: function(key, value) {
		this.transferData = this.transferData || {};

		if (this.transferData[key]) {
			console.warn('Overriding transfer data: ', key, ' from ', this.transferData[key], ' with ', value);
		}

		if (value.getDataForTransfer) {
			value = value.getDataForTransfer();
		} else {
			value = JSON.stringify(value);
		}

		this.transferData[key] = value;
	},


	getDnDEventData: function() {
		return new NextThought.model.app.dndInfo();
	},


	onDragStart: function(e) {
		var info = this.getDnDEventData();

		e.dataTransfer.setData(info.mimeType, info.getDataForTransfer());
	},

	onDragEnd: function() {}
});
