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
		root: 'Items'//,
		//totalProperty: 'FilteredTotalItemCount'
	},

	noCache: false,

	groupParam: undefined,
	groupDirectionParam: undefined,
	directionParam: undefined,
	pageParam: undefined,

	sortParam: undefined, //'sort',
	filterParam: undefined, //'filter',
	idParam: undefined, //'batchAround',

	startParam: undefined, //'batchStart',
	limitParam: undefined, //'batchSize',


	setSource: function(source) {
		//ForCredit, or Open
		this.source = source;
	},


	setURL: function(url) { this.url = url; },


	buildUrl: function() {
		if (Ext.isEmpty(this.url)) {
			Ext.Error.raise('URL required');
		}

		return Ext.String.urlAppend(this.url, Ext.Object.toQueryString({
			filter: 'LegacyEnrollmentStatus' + (this.source || 'ForCredit')
		}));
	}
});
