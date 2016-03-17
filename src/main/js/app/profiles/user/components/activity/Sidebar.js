export default Ext.define('NextThought.app.profiles.user.components.activity.Sidebar', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-user-activity-sidebar',

	requires: ['NextThought.app.stream.components.Filter'],

	layout: 'none',
	cls: 'activity-sidebar',

	BASE_FILTERS:[
		{
			displayText: 'Sort By',
			type: 'sort',
			name: 'sort-filters',
			cls: 'sort-group',
			paramName: 's',
			streamParam: 'sort',
			modifierName: 'b',
			modifierParam: 'batchAfter',
			defaultItem: 'created',
			items: {
				created: {
					displayText: 'Date Created',
					value: 'created',
					active: true,
					streamValue: {
						on: 'CreatedTime',
						order: 'descending'
					},
					modifier: {
						text: 'Date Range',
						cls: 'modifier',
						type: 'days',
						defaultItem: '0',
						items: [
							{ text: 'Anytime', value: '0', cls: 'option'},
							{ text: 'Past Week', value: '7', cls: 'option' },
							{ text: 'Past Month', value: '30', cls: 'option' },
							{ text: 'Past 3 months', value: '90', cls: 'option' },
							{ text: 'Past Year', value: '360', cls: 'option' }
						]
					}
				},
				recent: {
					displayText: 'Recent Activity',
					value: 'recent',
					streamValue: {
						on: 'Last Modified',
						order: 'descending'
					},
					active: false,
					modifier: {
						text: 'Date Range',
						cls: 'modifier',
						type: 'days',
						items: [
							{ text: 'Anytime', value: '0', cls: 'option' },
							{ text: 'Past Week', value: '7', cls: 'option' },
							{ text: 'Past Month', value: '30', cls: 'option' },
							{ text: 'Past 3 months', value: '90', cls: 'option' },
							{ text: 'Past Year', value: '360', cls: 'option' }
						]
					}
				},
				commented: {
					displayText: 'Most Commented',
					value: 'commented',
					streamValue: {
						on: 'ReferencedByCount',
						order: 'descending'
					},
					active: false,
					modifier: {
						text: 'Date Range',
						cls: 'modifier',
						type: 'days',
						items: [
							{ text: 'Anytime', value: '0', cls: 'option' },
							{ text: 'Past Week', value: '7', cls: 'option' },
							{ text: 'Past Month', value: '30', cls: 'option' },
							{ text: 'Past 3 months', value: '90', cls: 'option' },
							{ text: 'Past Year', value: '360', cls: 'option' }
						]
					}
				},
				liked: {
					displayText: 'Most Liked',
					value: 'liked',
					streamValue: {
						on: 'RecursiveLikeCount',
						order: 'descending'
					},
					active: false,
					modifier: {
						text: 'Date Range',
						cls: 'modifier',
						type: 'days',
						items: [
							{ text: 'Anytime', value: '0', cls: 'option' },
							{ text: 'Past Week', value: '7', cls: 'option' },
							{ text: 'Past Month', value: '30', cls: 'option' },
							{ text: 'Past 3 months', value: '90', cls: 'option' },
							{ text: 'Past Year', value: '360', cls: 'option' }
						]
					}
				}
			}
		}, {
			displayText: 'Activity Type',
			type: 'activity',
			cls: 'activities',
			multiselect: true,
			activeItems: [],
			paramName: 'a',
			streamParam: 'accepts',
			items: {
				discussions: {
					type: 'discussions',
					text: 'Discussions',
					streamValue: [
						'application/vnd.nextthought.forums.dflheadlinetopic',
						'application/vnd.nextthought.forums.communityheadlinetopic',
						'application/vnd.nextthought.forums.generalforumcomment',
						'application/vnd.nextthought.forums.communityheadlinetopic'
					]
				},
				notes: {
					type: 'notes',
					text: 'Notes',
					streamValue: [
						'application/vnd.nextthought.note'
					]
				},
				thoughts: {
					type: 'thoughts',
					text: 'Thoughts',
					streamValue:[
						'application/vnd.nextthought.forums.personalblogentry',
						'application/vnd.nextthought.forums.personalblogcomment'
					]
				},
				chat: {
					type: 'chat',
					text: 'Chat',
					streamValue:['application/vnd.nextthought.transcriptsummary']
				}
			},

			setActiveItem: function(el, activeItems) {
				if (!el) { return; }

				var items = el.querySelectorAll('.group-item'),
					item, type, input, i;

				for (i=0; i < items.length; i++) {
					item = items[i];
					type = item.getAttribute('data-value');
					input = item.querySelector('input');

					if (!input) { return; }

					if ((activeItems ||[]).indexOf(type) !== -1) {
						input.checked = true;
					}
					else {
						input.checked = false;
					}
				}
			}
		} 
	],

	items: [{
		xtype: 'stream-filter'
	}],

	initComponent: function() {
		this.callParent(arguments);

		if (!isFeature('profile-activity-filters')) {
			this.BASE_FILTERS = [];
		}

		this.filterCmp = this.down('stream-filter');
		this.filterCmp.filterGroups = this.BASE_FILTERS;
		this.filterCmp.onGroupSelect = this.onGroupSelect.bind(this);
		this.filterCmp.onItemSelect = this.onItemSelect.bind(this);

		this.resetFilters();

		this.onBodyClick = this.onBodyClick.bind(this);

		this.on({
			activate: this.onActivate.bind(this),
			deactivate: this.onDeactivate.bind(this)
		});
	},


	onActivate: function() {
		Ext.getBody().on('click', this.onBodyClick);
	},


	onDeactivate: function() {
		Ext.getBody().un('click', this.onBodyClick);
	},


	onBodyClick: function(e) {
		var filters = this.filters,
			keys = Object.keys(filters);

		if (!e.getTarget('.activity-sidebar')) {
			keys.forEach(function(key) {
				filters[key].active = false;
			});

			this.updateFilterUI();
		}
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
			text: item.text,
			value: key,
			active: isActive
		};
	},


	updateFilterUI: function() {
		this.filterCmp.setActiveFilters(this.filters);
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

		//set active to true for group, and false for the rest
		filterKeys.forEach(function(key) {
			if (key !== group) {
				filters[key].active = false;
			} else {
				filters[key].active = !filters[key].active;
			}
		});

		this.updateFilterUI();
	},


	__toggleMultiSelect: function(items, key) {
		var filtered;

		if (!items) {
			items = [];
		}

		filtered = (items || []).filter(function(item) {
			return item !== key;
		});

		if (filtered.length === items.length) {
			filtered.push(key);
		}

		return filtered;
	},


	getGroup: function(groupKey) {
		var i, found = false, g;
		for (i=0; i < this.filters.length && !found; i++) {
			g = this.filters[i];
			if (g.type === groupKey) {
				found = true;
			}
		}

		return g;
	},


	onItemSelect: function(itemKey, groupKey, modifierValue) {
		var group = this.getGroup(groupKey),
			modifier;

		if (!group) { return; }

		if (group.multiselect) {
			group.activeItems = this.__toggleMultiSelect(group.activeItems, itemKey);
		} else {
			group.activeItem = itemKey;
		}

		if (modifierValue) {
			modifier = this.__getModifier(group);
			if (modifier) {
				modifier.activeItem = modifierValue;
			}
		}

		group.active = false;

		this.replaceFilter();
	},


	/**
	 * Update the filter, should trigger the filter to be pushed to state i.e. queryParams
	 */
	replaceFilter: function() {
		var filters = this.filters,
			keys = Object.keys(filters),
			params = {}, me = this;

		keys.forEach(function(key) {
			var filter = filters[key],
				m = me.__getModifier(filter),
				active;

			if (filter.multiselect) {
				active = filter.activeItems || [];

				if (active.length) {
					params[filter.paramName] = filter.activeItems.join(',');
				}
			} else if (filter.activeItem && filter.activeItem !== filter.defaultItem) {
				params[filter.paramName] = filter.activeItem;
			}

			if (m && m.activeItem) {
				params[filter.modifierName] = m.activeItem;
			}
		});

		this.updateFilter(params);
	},

	/**
	 * Apply the state set by replaceFilter
	 */
	setFilterFromQueryParams: function(params) {
		var filters = this.filters,
			keys = Object.keys(filters), 
			me = this;

		keys.forEach(function(key) {
			var filter = filters[key],
				paramValue = params[filter.paramName],
				modifierValue = params[filter.modifierName], m;

			if (filter.multiselect) {
				filter.activeItems = paramValue && paramValue.split(',');
			} else {
				filter.activeItem = paramValue;
			}

			if (modifierValue) {
				m = me.__getModifier(filter);
				if (m) {
					m.activeItem = modifierValue;
				}
			}
		});

		this.updateFilterUI();
	},


	__getModifier: function(filter) {
		var activeItem = filter && (filter.activeItem || filter.defaultItem),
			item = filter.items && filter.items[activeItem],
			modifier = item && item.modifier;

		return modifier;	
	},

	__getModifierValue: function(value, type) {
		var m = value && type && moment().subtract(value, type),
			date = m && m.toDate();

		if (date && value !== "0") {
			return Math.round(date.getTime() / 1000);
		}
		return null;
	},
	/**
	 * Convert the current filters to params to pass to the stream
	 * @return {Object} config to pass to the stream
	 */
	getStreamParams: function() {
		var params = {},
			filters = this.filters,
			keys = Object.keys(this.filters), 
			me = this;

		function addMutliSelectValue(filter) {
			var activeItems = filter.activeItems || [],
				value = [];

			activeItems.forEach(function(item) {
				var v = filter.items[item].streamValue;
				if (v) {
					value.push(v);	
				}
			});

			if (value.length) {
				params[filter.streamParam] = value;
			}
		}

		function addSingleSelectValue(filter) {
			var activeItem = filter.activeItem || filter.defaultItem, 
				filterItem = activeItem && filter.items[activeItem],
				value = filterItem && filterItem.streamValue,
				modifier = filterItem && filterItem.modifier,
				m = {};

			if (value) {
				params[filter.streamParam] = value;
			}
			if (modifier && modifier.activeItem) {
				m[filter.modifierParam] = me.__getModifierValue(modifier.activeItem, modifier.type);
				params['modifier'] = m;
			}
		}

		keys.forEach(function(key) {
			var filter = filters[key];

			if (filter.multiselect) {
				addMutliSelectValue(filter);
			} else {
				addSingleSelectValue(filter);
			}
		});

		return params;
	}
});
