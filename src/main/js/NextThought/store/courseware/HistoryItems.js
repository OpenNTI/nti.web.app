export default Ext.define('NextThought.store.courseware.HistoryItems', {
	extend: 'Ext.data.Store',

	model: 'NextThought.model.courseware.UsersCourseAssignmentHistoryItem',

	proxy: {
		type: 'ajax',
		timeout: 360000, //one hour

		url: 'tbd',

		reader: {
			type: 'nti',
			root: 'Items',
			totalProperty: 'FilteredTotalItemCount',
			collectionTypes: {
				'application/vnd.nextthought.assessment.userscourseassignmenthistory': 1
			},

			onItemRead: function(item, key) {
				if (Ext.isArray(item)) {
					if (item[1] !== null) {
						item = item[1];
					} else {
						item = {Creator: item[0], Class: 'UsersCourseAssignmentHistoryItem'};
					}
				}

				item.AssignmentId = key;

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

		buildUrl: function(request) {
			var sort, dir,
				p = request.params;

			if (p && p.filter) {
				Ext.decode(p.filter).forEach(function(filter) {
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


	constructor: function(config) {
		this.proxy = Ext.clone(this.proxy);//get a local instance copy
		this.callParent(arguments);

		if (this.url) {
			this.proxy.url = this.url;
			delete this.url;
		}
	}
});
