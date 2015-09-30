Ext.define('NextThought.app.profiles.user.components.activity.Sidebar', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-user-activity-sidebar',

	requires: ['NextThought.app.stream.components.Filter'],

	BASE_FILTERS: {
		activity: {
			cls: 'activity',
			name: 'Activity Type',
			defaultItem: 'all',
			activeItem: null,
			active: false,
			items: {
				all: 'All Activity',
				notes: 'Notes'
			}
		},
		sort: {
			cls: 'sort',
			name: 'Sort By',
			defaultItem: 'recent',
			activeItem: null,
			active: false,
			items: {
				recent: 'Most Recent',
				activity: 'Recent'
			}
		}
	},

	layout: 'none',
	cls: 'activity-sidebar',

	items: [{xtype: 'stream-filter'}],

	initComponent: function() {
		this.callParent(arguments);

		this.filterCmp = this.down('stream-filter');
		this.filterCmp.onGroupSelect = this.onGroupSelect.bind(this);
		this.filterCmp.onItemSelect = this.onItemSelect.bind(this);

		this.resetFilters();
	},


	resetFilters: function() {
		this.filters = Ext.clone(this.BASE_FILTERS);
	},


	__mapItemForUI: function(group, key) {
		var isActive = false,
			item = group.items[key],
			active;

		if (group.multiselect) {
			active = group.activeItems;
			active = active.length ? group.activeItems : group.defaultItems;

			isActive = active.indexOf(key) >= 0;
		} else {
			active = group.activeItem || group.defaultItem;

			isActive = active === key;
		}

		return {
			text: item,
			value: key,
			active: isActive
		};
	},


	__mapGroupForUI: function(key) {
		var group = this.filters[key],
			items = group.items,
			itemKeys = Object.keys(items),
			activeText = '',
			cls = group.cls;

		if (group.multiselect) {
			cls = cls + ' multiselect';
		}

		if (group.active) {
			cls = cls + ' expanded';
		}

		if (group.multiselect) {
			activeText = group.activeItems.map(function(active) {
				return items[active];
			}).join(', ');
		} else {
			activeText = items[group.activeItem];
		}

		return {
			cls: cls,
			name: group.name,
			activeText: activeText,
			key: key,
			items: itemKeys.map(this.__mapItemForUI.bind(this, group))
		};
	},


	updateFilterUI: function() {
		var filterKeys = Object.keys(this.filters);

		this.filterCmp.setOptions(filterKeys.map(this.__mapGroupForUI.bind(this)));
	},


	userChanged: function(entity) {
		if (this.activeEntity !== entity) {
			this.resetFilters();
			this.updateFilterUI();
		}

		this.activeEntity = entity;
	},


	onGroupSelect: function(group) {
		var filters = this.filters,
			filterKeys = Object.keys(this.filters);

		filterKeys.forEach(function(key) {
			filters[key].active = key === group;
		});

		this.updateFilterUI();
	},


	__toggleMultiSelect: function(items, key) {
		var filtered = items.filter(function(item) {
			return item !== key;
		});

		if (filtered.length === items.length) {
			filtered.push(key);
		}

		return filtered;
	},


	onItemSelect: function(itemKey, groupKey) {
		var group = this.filters[groupKey];

		if (group.multiselect) {
			group.activeItems = this.__toggleMultiSelect(group.activeItems, itemKey);
		} else {
			group.activeItem = itemKey;
		}

		this.updateFilterUI();
	}
});
