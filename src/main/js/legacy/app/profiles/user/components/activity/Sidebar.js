const Ext = require('extjs');
const moment = require('moment');
const {isFeature} = require('legacy/util/Globals');

require('legacy/app/stream/components/Filter');
require('legacy/mixins/State');

module.exports = exports = Ext.define('NextThought.app.profiles.user.components.activity.Sidebar', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-user-activity-sidebar',

	STATE_KEY: 'profile-activity-filters',

	mixins: {
		State: 'NextThought.mixins.State'
	},

	layout: 'none',
	cls: 'activity-sidebar',

	items: [],

	getDefaultState () {
		return {
			sort: 'CreatedTime',
			batchAfter: 'anytime',
			accepts: 'all'
		};
	},

	getFilters () {
		function batchAfterGenerator (value, type) {
			let m = value && moment().subtract(value, type);
			let date = m && m.toDate();

			if (date) {
				date = Math.floor(date.getTime() / 1000);
			}

			return date || null;
		}

		if (!isFeature('profile-activity-filters')) {
			return [];
		}

		return [
			{
				displayText: 'Sort By',
				type: 'select',
				cls: 'sort-group',
				key: 'sort',
				items: [
					{
						displayText: 'Date Created',
						stateValue: 'CreatedTime',
						value: {
							on: 'CreatedTime',
							order: 'descending'
						}
					},
					{
						displayText: 'Recent Activity',
						stateValue: 'LastModified',
						value: {
							on: 'Last Modified',
							order: 'descending'
						}
					},
					{
						displayText: 'Most Commented',
						stateValue: 'ReferencedByCount',
						value: {
							on: 'ReferencedByCount',
							order: 'descending'
						}
					},
					{
						displayText: 'Most Liked',
						stateValue: 'RecursiveLikeCount',
						value: {
							on: 'RecursiveLikeCount',
							order: 'descending'
						}
					}
				]
			},
			{
				displayText: 'Date Range',
				type: 'single-select',
				cls: 'modifier',
				key: 'batchAfter',
				items: [
					{
						displayText: 'Anytime',
						stateValue: 'anytime',
						value: null
					},
					{
						displayText: 'Past Week',
						stateValue: 'pastweek',
						value: batchAfterGenerator(7, 'days')
					},
					{
						displayText: 'Past Month',
						stateValue: 'pastmonth',
						value: batchAfterGenerator(30, 'days')
					},
					{
						displayText: 'Past 3 Months',
						stateValue: 'pastthreemonths',
						value: batchAfterGenerator(90, 'days')
					},
					{
						displayText: 'Past Year',
						stateValue: 'pastyear',
						value: batchAfterGenerator(360, 'days')
					}
				]
			},
			{
				displayText: 'Activity Type',
				type: 'multi-select',
				cls: 'activities',
				key: 'accepts',
				allParam: '*/*',
				paramRequired: true,
				items: [
					{
						displayText: 'Discussions',
						stateValue: 'discussions',
						value: [
							'application/vnd.nextthought.forums.dflheadlinetopic',
							'application/vnd.nextthought.forums.communityheadlinetopic',
							'application/vnd.nextthought.forums.generalforumcomment',
							'application/vnd.nextthought.forums.communityheadlinetopic'
						].join(',')
					},
					{
						displayText: 'Notes',
						stateValue: 'notes',
						value: 'application/vnd.nextthought.note'
					},
					{
						displayText: 'Thoughts',
						stateValue: 'thoughts',
						value: [
							'application/vnd.nextthought.forums.personalblogentry',
							'application/vnd.nextthought.forums.personalblogcomment'
						].join(',')
					},
					{
						displayText: 'Chat',
						stateValue: 'chat',
						value: 'application/vnd.nextthought.transcriptsummary'
					}
				]
			}
		];
	},


	initComponent () {
		this.callParent(arguments);

		this.filterCmp = this.add({
			xtype: 'stream-filter',
			filters: this.getFilters(),
			setState: this.setFilterState.bind(this)
		});
	},


	userChanged (entity) {
		// if (this.activeEntity !== entity) {
		// 	this.resetFilters();
		// 	this.updateFilterUI();
		// }

		this.activeEntity = entity;
		this.restoreState();
	},


	restoreState () {
		this.applyState(this.getCurrentState() || this.getDefaultState());
	},


	setStreamCmp (stream) {
		this.filterCmp.bindToStream(stream);
	},


	setFilterState (state) {
		this.setState(state);
	},


	applyState (state) {
		let url = this.activeEntity && this.activeEntity.getLink('Activity');

		if (url) {
			state.url = url;
			this.filterCmp.applyState(state);
		}
	}
});



// Ext.define('xNextThought.app.profiles.user.components.activity.Sidebar', {
// 	extend: 'Ext.container.Container',
// 	alias: 'widget.xprofile-user-activity-sidebar',

// 	layout: 'none',
// 	cls: 'activity-sidebar',

// 	items: [],


// 	// initComponent () {
// 	// 	this.callParent(arguments);

// 	// 	if (!isFeature('profile-activity-filters')) {
// 	// 		this.BASE_FILTERS = [];
// 	// 	}

// 	// 	this.filterCmp = this.add({
// 	// 		xtype: 'stream-filter',
// 	// 		filterGroups: this.getFilters()
// 	// 	});

// 	// 	this.resetFilters();

// 	// 	this.onBodyClick = this.onBodyClick.bind(this);

// 	// 	this.on({
// 	// 		activate: this.onActivate.bind(this),
// 	// 		deactivate: this.onDeactivate.bind(this)
// 	// 	});
// 	// },


// 	setStreamCmp (cmp) {
// 		this.filterCmp.bindToStream(cmp);
// 	},


// 	onActivate: function () {
// 		Ext.getBody().on('click', this.onBodyClick);
// 	},


// 	onDeactivate: function () {
// 		Ext.getBody().un('click', this.onBodyClick);
// 	},


// 	onBodyClick: function (e) {
// 		var filters = this.filters,
// 			keys = Object.keys(filters);

// 		if (!e.getTarget('.activity-sidebar')) {
// 			keys.forEach(function (key) {
// 				filters[key].active = false;
// 			});

// 			this.updateFilterUI();
// 		}
// 	},


// 	resetFilters: function () {
// 		this.filters = Ext.clone(this.BASE_FILTERS);
// 	},


// 	updateFilterUI: function () {
// 		this.filterCmp.setActiveFilters(this.filters);
// 	},


// 	userChanged: function (entity) {
// 		if (this.activeEntity !== entity) {
// 			this.resetFilters();
// 			this.updateFilterUI();
// 		}

// 		this.activeEntity = entity;
// 	},


// 	onGroupSelect: function (group) {
// 		var filters = this.filters,
// 			filterKeys = Object.keys(this.filters);

// 		//set active to true for group, and false for the rest
// 		filterKeys.forEach(function (key) {
// 			if (key !== group) {
// 				filters[key].active = false;
// 			} else {
// 				filters[key].active = !filters[key].active;
// 			}
// 		});

// 		this.updateFilterUI();
// 	},


// 	__toggleMultiSelect: function (items, key) {
// 		var filtered;

// 		if (!items) {
// 			items = [];
// 		}

// 		filtered = (items || []).filter(function (item) {
// 			return item !== key;
// 		});

// 		if (filtered.length === items.length) {
// 			filtered.push(key);
// 		}

// 		return filtered;
// 	},


// 	getGroup: function (groupKey) {
// 		var i, found = false, g;
// 		for (i = 0; i < this.filters.length && !found; i++) {
// 			g = this.filters[i];
// 			if (g.type === groupKey) {
// 				found = true;
// 			}
// 		}

// 		return g;
// 	},


// 	onItemSelect: function (itemKey, groupKey, modifierValue) {
// 		var group = this.getGroup(groupKey),
// 			modifier;

// 		if (!group) { return; }

// 		if (group.multiselect) {
// 			group.activeItems = this.__toggleMultiSelect(group.activeItems, itemKey);
// 		} else {
// 			group.activeItem = itemKey;
// 		}

// 		if (modifierValue) {
// 			modifier = this.__getModifier(group);
// 			if (modifier) {
// 				modifier.activeItem = modifierValue;
// 			}
// 		}

// 		group.active = false;

// 		this.replaceFilter();
// 	},


// 	/*
// 	 * Update the filter, should trigger the filter to be pushed to state i.e. queryParams
// 	 */
// 	replaceFilter: function () {
// 		var filters = this.filters,
// 			keys = Object.keys(filters),
// 			params = {}, me = this;

// 		keys.forEach(function (key) {
// 			var filter = filters[key],
// 				m = me.__getModifier(filter),
// 				active;

// 			if (filter.multiselect) {
// 				active = filter.activeItems || [];

// 				if (active.length) {
// 					params[filter.paramName] = filter.activeItems.join(',');
// 				}
// 			} else if (filter.activeItem && filter.activeItem !== filter.defaultItem) {
// 				params[filter.paramName] = filter.activeItem;
// 			}

// 			if (m && m.activeItem) {
// 				params[filter.modifierName] = m.activeItem;
// 			}
// 		});

// 		this.updateFilter(params);
// 	},


// 	/*
// 	 * Apply the state set by replaceFilter
// 	 */
// 	setFilterFromQueryParams: function (params) {
// 		var filters = this.filters,
// 			keys = Object.keys(filters),
// 			me = this;

// 		keys.forEach(function (key) {
// 			var filter = filters[key],
// 				paramValue = params[filter.paramName],
// 				modifierValue = params[filter.modifierName], m;

// 			if (filter.multiselect) {
// 				filter.activeItems = paramValue && paramValue.split(',');
// 			} else {
// 				filter.activeItem = paramValue;
// 			}

// 			if (modifierValue) {
// 				m = me.__getModifier(filter);
// 				if (m) {
// 					m.activeItem = modifierValue;
// 				}
// 			}
// 		});

// 		this.updateFilterUI();
// 	},


// 	__getModifier: function (filter) {
// 		var activeItem = filter && (filter.activeItem || filter.defaultItem),
// 			item = filter.items && filter.items[activeItem],
// 			modifier = item && item.modifier;

// 		return modifier;
// 	},


// 	__getModifierValue: function (value, type) {
// 		var m = value && type && moment().subtract(value, type),
// 			date = m && m.toDate();

// 		if (date && value !== '0') {
// 			return Math.round(date.getTime() / 1000);
// 		}
// 		return null;
// 	},


// 	/**
// 	 * Convert the current filters to params to pass to the stream
// 	 * @return {Object} config to pass to the stream
// 	 */
// 	getStreamParams: function () {
// 		var params = {},
// 			filters = this.filters,
// 			keys = Object.keys(this.filters),
// 			me = this;

// 		function addMutliSelectValue (filter) {
// 			var activeItems = filter.activeItems || [],
// 				value = [];

// 			activeItems.forEach(function (item) {
// 				var v = filter.items[item].streamValue;
// 				if (v) {
// 					value.push(v);
// 				}
// 			});

// 			if (value.length) {
// 				params[filter.streamParam] = value;
// 			}
// 		}

// 		function addSingleSelectValue (filter) {
// 			var activeItem = filter.activeItem || filter.defaultItem,
// 				filterItem = activeItem && filter.items[activeItem],
// 				value = filterItem && filterItem.streamValue,
// 				modifier = filterItem && filterItem.modifier,
// 				m = {};

// 			if (value) {
// 				params[filter.streamParam] = value;
// 			}
// 			if (modifier && modifier.activeItem) {
// 				m[filter.modifierParam] = me.__getModifierValue(modifier.activeItem, modifier.type);
// 				params['modifier'] = m;
// 			}
// 		}

// 		keys.forEach(function (key) {
// 			var filter = filters[key];

// 			if (filter.multiselect) {
// 				addMutliSelectValue(filter);
// 			} else {
// 				addSingleSelectValue(filter);
// 			}
// 		});

// 		return params;
// 	}
// });
