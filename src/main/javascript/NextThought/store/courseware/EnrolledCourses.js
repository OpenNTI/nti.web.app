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
			beforeload: function() {
				var old = p;
				p = me.promiseToLoaded = new Promise();
				if (old && !old.isResolved()) {
					p.then(old);
				}
			},
			load: function(me, records, success) {
				if (!success) {
					p.reject('Store Failed to load');
				}

				Promise.pool(Ext.Array.map(
						me.getRange(),
						function(r) {
							return r.__precacheEntry();
						})).then(
					function() {
						p.fulfill(me);
					},
					function(reason) {
						p.reject(reason);
					});
			}
		});
	},


	onceLoaded: function() {
		return this.promiseToLoaded;
	},


	getCourseInstance: function(courseInstanceId) {
		var promise = new Promise(),
			me = this;

		this.onceLoaded().then(function() {
			me.each(function(r) {
				var instance = r.get('CourseInstance');
				if (instance && instance.getId() === courseInstanceId) {
					promise.fulfill(instance);
					return false;//stop iteration
				}
			});

			if (promise.state !== Promise.State.FULFILLED) {
				promise.reject('Not found');
			}
		}, function(reason) { promise.reject(reason); });

		return promise;
	},


	findCourse: function() {
		var promise = new Promise(),
			me = this,
			args = Ext.Array.clone(arguments);

		this.onceLoaded().then(function() {
			var i = me.find.apply(me, args);
			if (i >= 0) {
				promise.fulfill(me.getAt(i));
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
			var i = me.findBy.apply(me, args);
			if (i >= 0) {
				promise.fulfill(me.getAt(i));
			} else {
				promise.reject('Not found');
			}
		});

		return promise;
	}
});
