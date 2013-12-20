Ext.define('NextThought.store.courseware.AssignmentView', {
	extend: 'Ext.data.Store',
	model: 'NextThought.model.courseware.UsersCourseAssignmentHistoryItem',
	proxy: {
		type: 'ajax',
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

	constructor: function() {
		this.callParent(arguments);
		//Allow shortcutting the url setting.
		if (this.url) {
			this.proxy.url = this.url;
			delete this.url;
		}
	}
});
