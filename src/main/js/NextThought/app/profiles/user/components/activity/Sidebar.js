Ext.define('NextThought.app.profiles.user.components.activity.Sidebar', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-user-activity-sidebar',

	requires: ['NextThought.app.stream.components.Filter'],

	// BASE_FILTERS: {
	// 	activity: {
	// 		cls: 'activity', //class to apply to the item
	// 		name: 'Activity Type', //the text to display for the user
	// 		defaultItem: 'all', //the key of the item to show when nothing is selected
	// 		activeItem: null, //the key of whatever item is selected
	// 		active: false, //whether or not to expand this group
	// 		paramName: 'a', //the name to key off the query param
	// 		streamParam: 'accepts', //the name of the param to pass to the stream
	// 		items: {
	// 			all: {//the key is what is put in the query param
	// 				text: 'All Activity',//the text to display to the user for this option
	// 				streamValue: ['*']//the value to pass to the stream
	// 			},
	// 			notes: {
	// 				text: 'Notes',
	// 				streamValue: ['application/vnd.nextthought.note']
	// 			},
	// 			disscussions: {
	// 				text: 'Discussions',
	// 				streamValue: [
	// 					'application/vnd.nextthought.forums.dflheadlinetopic',
	// 					'application/vnd.nextthought.forums.communityheadlinetopic',
	// 					'application/vnd.nextthought.forums.generalforumcomment',
	// 					'application/vnd.nextthought.forums.communityheadlinetopic'
	// 				]
	// 			},
	// 			blogs: {
	// 				text: 'Thoughts',
	// 				streamValue: [
	// 					'application/vnd.nextthought.forums.personalblogentry',
	// 					'application/vnd.nextthought.forums.personalblogcomment'
	// 				]
	// 			},
	// 			chat: {
	// 				text: 'Chat',
	// 				streamValue: ['application/vnd.nextthought.transcriptsummary']
	// 			}

	// 		}
	// 	},
	// 	sort: {
	// 		cls: 'sort',
	// 		name: 'Sort By',
	// 		defaultItem: 'recent',
	// 		activeItem: null,
	// 		active: false,
	// 		paramName: 's',
	// 		streamParam: 'sort',
	// 		items: {
	// 			recent: {
	// 				text: 'Most Recent',
	// 				streamValue: {
	// 					on: 'CreatedTime',
	// 					order: 'DESC'
	// 				}
	// 			},
	// 			activity: {
	// 				text: 'Recent Activity',
	// 				streamValue: {
	// 					on: 'Last Modified',
	// 					order: 'DESC'
	// 				}
	// 			}
	// 		}
	// 	}
	// },

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
			items: {
				created: {
					displayText: 'Date Created',
					cls: 'sort',
					active: true,
					streamValue: {
						on: 'CreatedTime',
						order: 'DESC'
					},
					modifier: {
						text: 'Date Range',
						cls: 'modifier',
						items: [
							{ text: 'Anytime', value: '', cls: 'option selected'},
							{ text: 'Past Week', value: 'week=1', cls: 'option' },
							{ text: 'Past Month', value: 'month=1', cls: 'option' },
							{ text: 'Past 3 months', value: 'month=3', cls: 'option' },
							{ text: 'Past Year', value: 'year=1', cls: 'option' }
						]
					}
				},
				recent: {
					displayText: 'Recent Activity',
					cls: 'sort',
					streamValue: {
						on: 'Last Modified',
						order: 'DESC'
					},
					active: false,
					modifier: {
						text: 'Date Range',
						items: [
							{ text: 'Anytime', value: '', cls: 'option' },
							{ text: 'Past Week', value: 'week=1', cls: 'option' },
							{ text: 'Past Month', value: 'month=1', cls: 'option' },
							{ text: 'Past 3 months', value: 'month=3', cls: 'option' },
							{ text: 'Past Year', value: 'year=1', cls: 'option' }
						]
					}
				},
				commented: {
					displayText: 'Most Commented',
					cls: 'sort',
					streamValue: {
						on: 'Last Modified',
						order: 'DESC'
					},
					active: false,
					modifier: {
						text: 'Date Range',
						items: [
							{ text: 'Anytime', value: '', cls: 'option' },
							{ text: 'Past Week', value: 'week=1', cls: 'option' },
							{ text: 'Past Month', value: 'month=1', cls: 'option' },
							{ text: 'Past 3 months', value: 'month=3', cls: 'option' },
							{ text: 'Past Year', value: 'year=1', cls: 'option' }
						]
					}
				},
				liked: {
					displayText: 'Most Liked',
					cls: 'sort',
					streamValue: {
						on: 'Last Modified',
						order: 'DESC'
					},
					active: false,
					modifier: {
						text: 'Date Range',
						items: [
							{ text: 'Anytime', value: '', cls: 'option' },
							{ text: 'Past Week', value: 'week=1', cls: 'option' },
							{ text: 'Past Month', value: 'month=1', cls: 'option' },
							{ text: 'Past 3 months', value: 'month=3', cls: 'option' },
							{ text: 'Past Year', value: 'year=1', cls: 'option' }
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


	onItemSelect: function(itemKey, groupKey) {
		var group = this.getGroup(groupKey);

		if (!group) { return; }

		if (group.multiselect) {
			group.activeItems = this.__toggleMultiSelect(group.activeItems, itemKey);
		} else {
			group.activeItem = itemKey;
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
			params = {};

		keys.forEach(function(key) {
			var filter = filters[key],
				active;

			if (filter.multiselect) {
				active = filter.activeItems || [];

				if (active.length) {
					params[filter.paramName] = filter.activeItems.join(',');
				}
			} else if (filter.activeItem && filter.activeItem !== filter.defaultItem) {
				params[filter.paramName] = filter.activeItem;
			}
		});

		this.updateFilter(params);
	},

	/**
	 * Apply the state set by replaceFilter
	 */
	setFilterFromQueryParams: function(params) {
		var filters = this.filters,
			keys = Object.keys(filters);

		keys.forEach(function(key) {
			var filter = filters[key],
				paramValue = params[filter.paramName];


			if (filter.multiselect) {
				filter.activeItems = paramValue && paramValue.split(',');
			} else {
				filter.activeItem = paramValue;
			}
		});

		this.updateFilterUI();
	},

	/**
	 * Convert the current filters to params to pass to the stream
	 * @return {Object} config to pass to the stream
	 */
	getStreamParams: function() {
		var params = {},
			filters = this.filters,
			keys = Object.keys(this.filters);

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
			var activeItem = filter.activeItem,
				filterItem = activeItem && filter.items[activeItem],
				value = filterItem && filterItem.streamValue;

			if (value) {
				params[filter.streamParam] = value;
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
