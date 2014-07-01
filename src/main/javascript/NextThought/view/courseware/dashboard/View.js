Ext.define('NextThought.view.courseware.dashboard.View', {
	extend: 'NextThought.view.courseware.dashboard.AbstractView',
	alias: 'widget.course-dashboard',

	requires: [
		'NextThought.view.courseware.dashboard.tiles.*'
	],

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},

	initComponent: function() {
		this.callParent(arguments);
		this.initCustomScrollOn('content');
	},


	statics: {
		dateOverride: null//new Date('2013-12-30')
	},


	bundleChanged: function(bundle) {
		var courseId = bundle && bundle.getId(),
			l, toc, course, courseNavStore,
			date = this.self.dateOverride || new Date();//now

		if (this.course !== courseId) {
			this.hasItems = true;
			this.tileContainer.removeAll(true);
		}

		if (!bundle || $AppConfig.disableDashboard) {
			return;
		}

		this.course = courseId;

		l = bundle.__getLocationInfo();

		if (l && l !== ContentUtils.NO_LOCATION) {
			toc = l.toc.querySelector('toc');
			course = toc && toc.querySelector('course');
			courseNavStore = bundle.getNavigationStore && bundle.getNavigationStore();
			if (!courseNavStore) {
				this.hasItems = false;
				this.fireEvent('hide-dashboard-tab', this);
				return;
			}

			this.applyStore(courseNavStore, date, course, l);
		}
	},


	applyStore: function(store, date, course, locationInfo) {
		var me = this, nodes, que = [];
		Ext.destroy(this._buildCallback);
		if (store.building) {
			this._buildCallback = this.mon(store, {
				destroyable: true,
				single: true,
				built: Ext.bind(this.applyStore, this, arguments)
			});
			return;
		}

		if (this.el) {
			this.el.mask(getString('NextThought.view.courseware.dashboard.View.loading'));
		}

		nodes = store.findByDate(date);
		if (!nodes.length) {
			if (this.el) {
				this.el.unmask();
			}
			this.hasItems = false;
			this.fireEvent('hide-dashboard-tab', this);
			return;
		}

		nodes.forEach(function(node) {
			que.push(new Promise(function(fulfill) {
				me.queryTiles(date, course, locationInfo, node, fulfill);
			}));
		});

		Promise.all(que)
			.done(this.applyTiles.bind(this))
			.fail(function() { if (me.el) {me.el.unmask();} });
	},


	applyTiles: function(tiles) {
		try {
			var video;
			tiles = tiles.reduce(function(agg, v) { return agg.concat(v); }, []);
			tiles = tiles.filter(function(o) {
				if (o && o instanceof NextThought.view.courseware.dashboard.tiles.Videos) {
					if (!video || video.sources.length < o.sources.length) {
						video = o;
					}
					return false;
				}
				return !!o;
			});

			if (video) {
				tiles.push(video);
			}


			this.setTiles(tiles);
			if (!tiles.length) {
				this.hasItems = false;
				this.fireEvent('hide-dashboard-tab', this);
			}
		}
		catch (e) {
			console.error(e.stack || e.message || e);
		}
		finally {
			if (this.el) {
				this.el.unmask();
			}
		}
	},


	/**
	 * Return a set of tile configs/instances for the given arguments.
	 *
	 * This will ask each implementation if it has something to show, if it does it will return a config
	 *
	 * @see NextThought.view.courseware.dashboard.tiles.Tile#getTileFor
	 *
	 * @param {Date} date
	 * @param {Node} course
	 * @param {Object} location
	 * @param {NextThought.model.courseware.navigation.Node} courseNode
	 * @param {Function} callback
	 * @param {Array} callback.tiles
	 */
	queryTiles: function(date, course, location, courseNode, callback) {
		var NS = NextThought.view.courseware.dashboard.tiles,
			tiles = [],
			queue = [],
			me = this,
			push = tiles.push;

		Ext.Object.each(NS, function(clsName, cls) {
			var fn = cls.getTileFor;
			if (fn) {
				//make each query in to the dashboard tiles release the current
				// processes so that its long-exec time does not make the course-set
				// time does not appear to take several seconds/minutes
				fn = Ext.Function.createBuffered(fn, 1, cls, null);
				fn.$test = cls.$className;
				queue.push(fn);
			}
		});


		if (!courseNode) {
			console.warn('No course node');
			Ext.callback(callback, me, [tiles]);
			return;
		}


		Ext.each(queue.slice(), function(fn) {
			//console.debug(fn.$test + ' Started');
			fn(date, course, location, courseNode, function finish(o) {
				//console.debug(fn.$test + ' Finished');
				queue.pop();
				if (o) {
					push[Ext.isArray(o) ? 'apply' : 'call'](tiles, o);
				}

				if (!callback) {
					console.error('Called more than once?');
				}

				if (queue.length === 0) {
					Ext.callback(callback, me, [tiles], 1);
					callback = null;
				}
			});
		});
	}
});



