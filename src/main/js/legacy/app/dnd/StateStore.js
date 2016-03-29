var Ext = require('extjs');
var CommonStateStore = require('../../common/StateStore');


module.exports = exports = Ext.define('NextThought.app.dnd.StateStore', {
	extend: 'NextThought.common.StateStore',


	setActiveDragItem: function (activeItem) {
		this.activeDragItem = activeItem;

		if (activeItem && activeItem.getPlaceholderStyles) {
			this.placeholderStyles = activeItem.getPlaceholderStyles();
		}

		this.fireEvent('drag-start');
	},


	removeActiveDragItem: function (activeItem) {
		if (this.activeDragItem === activeItem) {
			delete this.activeItem;
			this.fireEvent('drag-stop');
		}
	},


	getActiveDragItem: function () {
		return this.activeDragItem;
	},


	getPlaceholderStyles: function () {
		var styles;

		if (this.placeholderStyles) {
			styles = this.placeholderStyles;
		} else if (this.activeDragItem && this.activeDragItem.getPlaceholderStyles()) {
			styles = this.activeDragItem.getPlaceholderStyles();
		}

		return styles || {};
	}
});
