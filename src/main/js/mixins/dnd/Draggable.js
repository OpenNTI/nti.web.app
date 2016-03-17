/**
 * Handle adding and removing listeners for dropping actions
 *
 * Things that mixin this in can implement, onDragStart and onDragEnd
 * to add custom handlers
 *
 * To limit which part of the target can start a drag, things can implement getDragHandle
 * to return an element
 *
 * It can also implement a getDragTarget method, otherwise this.el.dom will be used
 */
Ext.define('NextThought.mixins.dnd.Draggable', {
	requires: [
		'NextThought.app.dnd.Draggable'
	],

	/**
	 * If we haven't yet, set up the draggable wrapper
	 */
	initDragging: function() {
		if (!this.Draggable) {
			this.Draggable = new NextThought.app.dnd.Draggable({
				ghostImageScale: this.ghostImageScale,
				dropPlaceholderStyles: this.dropPlaceholderStyles,
				getDragTarget: this.getDragTarget.bind(this),
				getDragBoundingClientRect: this.getDragBoundingClientRect.bind(this),
				getDragHandle: this.getDragHandle && this.getDragHandle.bind(this),
				onDragStart: this.onDragStart && this.onDragStart.bind(this),
				onDragEnd: this.onDragEnd && this.onDragEnd.bind(this)
			});
		}
	},


	getDragTarget: function() {
		return this.el && this.el.dom;
	},


	getDragBoundingClientRect: function() {
		var target = this.getDragTarget();

		return target && target.getBoundingClientRect();
	},


	enableDragging: function() {
		this.initDragging();

		if (!this.rendered) {
			this.on('afterrender', this.Draggable.enableDragging.bind(this.Draggable));
		} else {
			this.Draggable.enableDragging();
		}
	},


	disableDragging: function() {
		this.initDragging();

		if (!this.rendered) {
			this.on('afterrender', this.Draggable.disableDragging.bind(this.Draggable));
		} else {
			this.Draggable.disableDragging();
		}
	},


	/**
	 * Add values to be set on the dataTransfer object.
	 */
	setDataTransfer: function(key, value) {
		this.initDragging();

		this.Draggable.setDataTransfer(key, value);
	}
});
