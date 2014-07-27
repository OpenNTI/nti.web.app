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
		function c(o) {return (o && o.get('CourseInstance').asUIData().title) || '';}
		function sort(s) {
			s.sort([{
				sorterFn: function(a, b) {
					return	c(a).strcmp(c(b)); }
			}]);
		}

		var p = this.promiseToLoaded = new Deferred(),
			me = this;
		this.callParent(arguments);
		this.on({
			scope: this,
			beforeload: function() {
				var old = p;
				p = me.promiseToLoaded = new Deferred();
				p.then(function() { old.fulfill(me); });
			},
			load: function(me, records, success) {
				me.sorters.clear();//don't sort on uiData() until precache is done.
				if (!success) {
					p.reject('Store Failed to load');
					return;
				}

				var dead = [],
					bad = dead.push.bind(dead);

				function prune() {
					if (!dead.length) {return;}

					console.warn('Ignoring Courses that cannot resolve...', dead);
					me.remove(dead);
				}

				Promise.all(Ext.Array.map(me.getRange(), function(r) {
							return r.__precacheEntry().fail(function() { bad(r); });
						}))
						.then(prune)
						.then(sort.bind(me, [me]))
						.fail(function(e) { console.warn('Problems sorting...', e);})//catch
						.then(function() {
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


	destroy: function() {
		this.destroyed = true;
		this.removeAll(true);
		this.promiseToLoaded.fulfill(this);
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
