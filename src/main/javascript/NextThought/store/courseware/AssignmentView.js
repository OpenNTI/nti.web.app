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
			root: 'Items'
		},

		noCache: false,

		//Don't send any params with this store load.
		groupParam: undefined,
		groupDirectionParam: undefined,
		sortParam: undefined,
		filterParam: undefined,
		directionParam: undefined,
		idParam: undefined,
		//When we start paging, we will define these
		pageParam: undefined,
		startParam: undefined,
		limitParam: undefined
	},
	sorters: {
		property: 'Creator',
		transform: function(r) {return r && r.toString().toLowerCase();}
		//sorterFn: Globals.getCaseInsensitiveNaturalSorter('Creator')
	},

	constructor: function() {
		this.proxy = Ext.clone(this.proxy);//get a local instance copy
		this.callParent(arguments);
		//Allow shortcutting the url setting.
		if (this.url) {
			this.proxy.url = this.url;
			delete this.url;
		}
	}
});
