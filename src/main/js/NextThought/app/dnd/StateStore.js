Ext.define('NextThought.app.dnd.StateStore', {
	extend: 'NextThought.common.StateStore',


	setActiveDragItem: function(activeItem) {
		this.activeDragItem = activeItem;

		this.fireEvent('drag-start');
	},


	removeActiveDragItem: function(activeItem) {
		if (this.activeDragItem === activeItem) {
			delete this.activeItem;
			this.fireEvent('drag-stop');
		}
	},


	getActiveDragItem: function() {
		return this.activeDragItem;
	}
});
