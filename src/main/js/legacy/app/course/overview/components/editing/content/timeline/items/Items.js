const Ext = require('extjs');

require('./Item');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.timeline.items.Items', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-timeline-items',
	cls: 'timeline-items timeline-item-selection',
	layout: 'none',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		this.addItems(this.record || this.selectedItems);
	},

	addItems: function (items) {
		var me = this;
		if (items && !(items instanceof Array)) {
			items = [items];
		}

		me.selectedItems = items;

		me.add(items.map(function (item, index) {
			return {
				xtype: 'overview-editing-timeline-items-item',
				record: item,
				parentRecord: me.parentRecord,
				rootRecord: me.rootRecord
			};
		}));
	},

	getItems: function () {
		return this.selectedItems;
	}
});
