Ext.define('NextThought.app.dnd.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.dnd.StateStore'
	],


	constructor: function(config) {
		this.callParent(arguments);

		this.DnDStore = NextThought.app.dnd.StateStore.getInstance();
	},



	setActiveDragItem: function(activeItem) {
		this.DnDStore.setActiveDragItem(activeItem);
	},


	removeActiveDragItem: function(activeItem) {
		this.DnDStore.removeActiveDragItem(activeItem);
	},


	onNoDropHandler: function() {
		if (this.activeDragItem) {
			this.activeDragItem.onNoDrop();
		}
	},


	onDropFail: function() {
		if (this.activeDragItem) {
			this.activeDragItem.onNoDrop();
		}
	}
});
