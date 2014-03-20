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
		function sort(s) {
			s.sort([{
				sorterFn: function(a, b) {
					return	a.get('CourseInstance').asUIData().title.strcmp(
							b.get('CourseInstance').asUIData().title); }
			}]);
		}

		var p = this.promiseToLoaded = new Deffered(),
			me = this;
		this.callParent(arguments);
		this.on({
			scope: this,
			beforeload: function() {
				var old = p;
				p = me.promiseToLoaded = new Deffered();
				old.then(function() {return p;});
				old.fulfill(me);
			},
			load: function(me, records, success) {
				me.sorters.clear();//don't sort on uiData() until precache is done.
				if (!success) {
					p.reject('Store Failed to load');
					return;
				}

				Promise.pool(Ext.Array.map(
						me.getRange(),
						function(r) {
							return r.__precacheEntry();
						})).then(
					function() {
						sort(me);
						p.fulfill(me);
					},
					function(reason) {
						//don't send fulfilled promise values with the error.
						reason = reason.map(function(o) {
							return o && o.isModel ? true : o;
						});
						p.reject(reason);
					});
			}
		});
	},


	onceLoaded: function() {
		return this.promiseToLoaded;
	},


	getCourseInstance: function(courseInstanceId) {
		var me = this;

		return this.onceLoaded()
				.then(function() {
					return new Promise(function(fulfill, not) {
						var found = false;
						me.each(function(r) {
							var instance = r.get('CourseInstance');
							if (instance && instance.getId() === courseInstanceId) {
								found = instance;
								return false;//stop iteration
							}
						});

						if (!found) {
							return not('getCourseInstance: Not found: ' + courseInstanceId);
						}

						fulfill(found);
					});
				});
	},


	findCourse: function() {
		var me = this,
			args = Ext.Array.clone(arguments);

		return this.onceLoaded().then(function() {
					return new Promise(function(fulfill, not) {
						var i = me.find.apply(me, args);
						if (i >= 0) {
							return fulfill(me.getAt(i));
						}
						return not('findCourse: Not found');
					});
		});
	},


	findCourseBy: function() {
		var me = this,
			args = Ext.Array.clone(arguments);

		return this.onceLoaded().then(function() {
					return new Promise(function(fulfill, not) {
						var i = me.findBy.apply(me, args);
						if (i >= 0) {
							return fulfill(me.getAt(i));
						}

						not('findCourseBy: Not found');
					});
				});
	},


	/**
	 * I'm replacing the parent class's implementation so that I can know if the iteration was aborted or not.
	 *
	 * @param {Function} fn
	 * @param {Object} [scope]
	 * @return {Boolean|Number}
	 */
	each: function(fn, scope) {
		var data = this.data.items,
			dLen = data.length,
			record, d, ret = false;

		for (d = 0; d < dLen; d++) {
			record = data[d];
			if (fn.call(scope || record, record, d, dLen) === false) {
				ret = d;
				break;
			}
		}
		return ret;
	}

});
