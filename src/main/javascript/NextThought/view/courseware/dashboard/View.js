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


	getCurrentTitle: function() {
		return this.currentTitle || 'Dashboard';
	},


	courseChanged: function(courseInstance) {
		if (!courseInstance) {
			this.tileContainer.removeAll(true);
			delete this.currentTitle;
			return;
		}

		var l = courseInstance.__getLocationInfo(),
			me = this,
			toc, course,
			courseNavStore,
			date = this.self.dateOverride || new Date();//now

		this.currentTitle = courseInstance.asUIData().title + ' - Dashboard';

		if (l && l !== ContentUtils.NO_LOCATION) {
			toc = l.toc.querySelector('toc');
			course = toc && toc.querySelector('course');
			courseNavStore = courseInstance.getNavigationStore();
			if (!courseNavStore) {
				return;
			}

			if (me.el) {
				me.el.mask('Loading...');
			}

			this.queryTiles(
				date, course, l,
				courseNavStore.getCurrentBy(date),
				function(tiles) {
					try {
						me.setTiles(tiles);
					}
					catch (e) {
						console.error(e.stack || e.message || e);
					}
					finally {
						if (me.el) {
							me.el.unmask();
						}
					}
				}
			);
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
				fn = Ext.bind(fn, cls);
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
			console.log(fn.$test + ' Started');
			fn(date, course, location, courseNode, function finish(o) {
				console.log(fn.$test + ' Finished');
				queue.pop();
				if (o) {
					push[Ext.isArray(o) ? 'apply' : 'call'](tiles, o);
				}

				if (queue.length === 0) {
					Ext.callback(callback, me, [tiles]);
				}
			});
		});
	}
});



