var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.store.courseware.AssignmentView', {
	extend: 'Ext.data.Store',
	model: 'NextThought.model.courseware.UsersCourseAssignmentHistoryItem',
	proxy: {
		type: 'ajax',
		timeout: 3600000,//hour
		headers: {
			'Accept': 'application/vnd.nextthought.collection+json',
			'Content-Type': 'application/json'
		},
		url: 'tbd',
		reader: {
			type: 'nti',
			root: 'Items',
			totalProperty: 'FilteredTotalItemCount',
			collectionTypes: {
				'application/vnd.nextthought.assessment.userscourseassignmenthistory': 1
			},
			onItemRead: function (item) {
				if (Ext.isArray(item)) {
					if (item[1] !== null) {
						return item[1];
					}
					item = {Creator: item[0], Class: 'UsersCourseAssignmentHistoryItem'};
				}
				return item;
			}
		},

		noCache: false,

		groupParam: undefined,
		groupDirectionParam: undefined,
		directionParam: undefined,

		sortParam: 'sort',
		filterParam: 'filter',
		idParam: 'batchAround',

		pageParam: undefined,
		startParam: 'batchStart',
		limitParam: 'batchSize',


		buildUrl: function (request) {
			var sort, dir,
				p = request.params;

			if (p && p.filter) {
				Ext.decode(p.filter).forEach(function (filter) {
					if (filter.property === 'LegacyEnrollmentStatus') {
						p.filter = filter.property + filter.value;
					} else if (filter.property === 'usernameSearchTerm') {
						p.usernameSearchTerm = filter.value;
					}
				});
			}

			if (p && p.sort) {
				dir = {
					asc: 'ascending',
					desc: 'descending'
				};
				sort = Ext.decode(p.sort)[0];
				p.sortOn = sort.property;
				p.sortOrder = dir[(sort.direction || 'asc').toLowerCase()] || sort.direction;
				delete p.sort;
			}

			return this.url;
		}
	},

	filters: [
		{id: 'LegacyEnrollmentStatus', property: 'LegacyEnrollmentStatus', value: 'ForCredit'}
	],

	sorters: [
		{property: 'realname', direction: 'ascending'}
	],

	pageSize: 1000,

	buffered: true,

	constructor: function () {
		this.proxy = Ext.clone(this.proxy);//get a local instance copy
		this.callParent(arguments);
		//Allow shortcutting the url setting.
		if (this.url) {
			this.proxy.url = this.url;
			delete this.url;
		}

		if (this.disablePaging) {
			this.proxy.startParam = undefined;
			this.proxy.limitParam = undefined;
			this.proxy.idParam = undefined;
		}
	},


	getFromPageSourceRecord: function (record) {
		var match, id = record.getId(),
			creator = record.get('Creator'),
			creatorId = Ext.isString(creator) ? creator : creator.getId();

		this.data.forEach(function (item) {
			if (item.getId() === id) {
				match = item;
			} else if (item.get('Creator').getId() === creatorId) {
				match = item;
			}

			return !match;
		});

		return match;
	}
});
