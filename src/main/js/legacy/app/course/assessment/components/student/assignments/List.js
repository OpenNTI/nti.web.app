const Ext = require('extjs');

const {naturalSortComparator} = require('legacy/util/Globals');

require('./ListItem');


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
		var items = this.getItemsFrom(store),
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

	getItemsFrom: function (store) {

		const items = store.getRange();
		let seen = {};

		return items.filter((item) => {
			const id = item.get('actualId') || item.get('id');

			if (!id) { return true; }

			const hasBeenSeen = seen[id];

			seen[id] = true;

			return !hasBeenSeen;
		});
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
