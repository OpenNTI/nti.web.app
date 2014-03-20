Ext.define('NextThought.store.courseware.AvailableCourses', {
	extend: 'Ext.data.Store',

	model: 'NextThought.model.courseware.CourseCatalogEntry',
	proxy: {
		type: 'ajax',
		timeout: 3600000,//hour
		headers: {
			'Accept': 'application/vnd.nextthought.collection+json',
			'Content-Type': 'application/json'
		},
		url: 'tbd',
		reader: {
			type: 'json',
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
	sorters: [
		{
			property: 'Title',
			direction: 'asc'
		}
	],

	constructor: function() {
		var p = this.promiseToLoaded = new Deffered(),
			me = this;
		this.callParent(arguments);
		this.on({
			scope: this,
			beforeload: function() {
				var old = p;
				p = me.promiseToLoaded = new Deffered();
				p.then(function() { old.fulfill(me); });
			},
			load: function(me, records, success) {
				if (!success) {
					p.reject('Store Failed to load');
					return;
				}
				p.fulfill(me);
			}
		});
	},


	onceLoaded: function() {
		return this.promiseToLoaded;
	}
});
