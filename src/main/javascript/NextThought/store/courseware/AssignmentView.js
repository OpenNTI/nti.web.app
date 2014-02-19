Ext.define('NextThought.store.courseware.AssignmentView', {
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
			onItemRead: function(item) {
				if (Ext.isArray(item)) {
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


		buildUrl: function(op) {
			var filter, sort, dir,
				p = op.params;

			if (p.filter) {
				filter = Ext.decode(p.filter)[0];
				p.filter = filter.property + filter.value;
			}

			if (p.sort) {
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
			/*
			return Ext.urlAppend(this.url, Ext.Object.toQueryString(
					Ext.applyIf(p, {
						filter: 'LegacyEnrollmentStatusForCredit',
						sortOn: 'realname'
					})
			));
			*/
		}
	},

	filters: [
		{id: 'LegacyEnrollmentStatus', property: 'LegacyEnrollmentStatus', value: 'ForCredit'}
	],

	sorters: [
		{property: 'realname', direction: 'ascending'}
	],

	pageSize: 50,

	buffered: true,

	constructor: function() {
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
	}
});
