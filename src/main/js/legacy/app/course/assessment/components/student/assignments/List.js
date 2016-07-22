var Ext = require('extjs');
var AssignmentsListItem = require('./ListItem');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.student.assignments.List', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-assignment-list',
	ui: 'course-assessment',
	cls: 'assignment-list',
	layout: 'none',
	itemType: 'course-assessment-assignment-list-item',

	initComponent: function () {
		this.callParent(arguments);

		this.addItems(this.store);
		if (this.store) {
			this.store.on('refresh', 'onRefresh', this);
		}
	},

	addItems: function (store) {
		var items = this.store ? this.store.getRange() : [],
			itemType = this.itemType,
			navigateToItem = this.navigateToItem,
			editAssignment = this.editAssignment,
			container = this.getItemsContainer();

		this.fireEvent((items.length > 0) ? 'show-parent' : 'hide-parent');

		if(container) {
			container.add(items.map(function (item) {
				return {
					xtype: itemType,
					assignment: item.get('item'),
					history: item.get('history'),
					item: item,
					navigateToItem: navigateToItem,
					editAssignment: editAssignment
				};
			}));
		}
	},

	getItemsContainer: function () {
		return this;
	},

	onRefresh: function (store) {
		var container = this.getItemsContainer();
		if (container) {
			container.removeAll(true);
		}

		this.addItems(store);
	}
});
