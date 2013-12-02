Ext.define('NextThought.store.courseware.EnrolledCourses', {
	extend: 'Ext.data.Store',
	requires: ['NextThought.util.Promise'],
	model: 'NextThought.model.courseware.CourseInstanceEnrollment',
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


	constructor: function() {
		var p = this.promiseToLoaded = new Promise(),
			me = this;
		this.callParent(arguments);
		this.on({
			scope: this,
			single: true,
			load: function() { p.fulfill(me); }
		});
	},


	onceLoaded: function() {
		return this.promiseToLoaded;
	},


	getCourse: function(courseInstanceId) {
		var promise = new Promise(),
			me = this;

		this.onceLoaded().then(function() {
			me.each(function(r) {
				var instance = r.get('CourseInstance');
				if (instance && instance.getId() === courseInstanceId) {
					promise.fulfill(instance);
				}
			});

			if (promise.state !== Promise.State.FULFILLED) {
				promise.reject('Not found');
			}
		});

		return promise;
	},


	findCourse: function() {
		var promise = new Promise(),
			me = this,
			args = Ext.Array.clone(arguments);

		this.onceLoaded().then(function() {
			var instance = me.find.apply(me, args);
			if (instance >= 0) {
				promise.fulfill(me.getAt(instance));
			} else {
				promise.reject('Not found');
			}
		});

		return promise;
	},


	findCourseBy: function() {
		var promise = new Promise(),
			me = this,
			args = Ext.Array.clone(arguments);

		this.onceLoaded().then(function() {
			var instance = me.findBy.apply(me, args);
			if (instance >= 0) {
				promise.fulfill(me.getAt(instance));
			} else {
				promise.reject('Not found');
			}
		});

		return promise;
	}
});
