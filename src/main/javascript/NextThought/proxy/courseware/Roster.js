Ext.define('NextThought.proxy.courseware.Roster', {
	extend: 'Ext.data.proxy.Rest',
	alias: 'proxy.nti.roster',

	timeout: 3600000,//hour
	appendId: false,

	headers: {
		'Accept': 'application/vnd.nextthought.collection+json',
		'Content-Type': 'application/json'
	},

	reader: {
		type: 'json',
		root: 'Items',
		totalProperty: 'FilteredTotalItemCount'
	},

	noCache: false,

	groupParam: undefined,
	groupDirectionParam: undefined,
	directionParam: undefined,
	pageParam: undefined,

	sortParam: 'sort',
	filterParam: 'filter',
	idParam: 'batchAround',

	startParam: 'batchStart',
	limitParam: 'batchSize',

	setURL: function(url) {
		this.url = url;
	},


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
			p.sortOrder = dir[(sort.direction || 'asc').toLowerCase()];
			delete p.sort;
		}

		return Ext.urlAppend(this.url, Ext.Object.toQueryString(
				Ext.applyIf(p, {
					filter: 'LegacyEnrollmentStatusForCredit',
					sortOn: 'realname'
				})
		));
	}
});
