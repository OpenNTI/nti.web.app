Ext.define('NextThought.view.course.dashboard.View', {
	extend: 'NextThought.view.course.dashboard.AbstractView',
	alias: 'widget.course-dashboard',

	requires: [
		'NextThought.view.course.dashboard.tiles.*'
	],

	mixins:{
		customScroll: 'NextThought.mixins.CustomScroll'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.initCustomScrollOn('content');
	},


	onCourseChanged: function (pageInfo) {
		if (!pageInfo.isPartOfCourse()) {
			this.tileContainer.removeAll(true);
			return;
		}

		var l = ContentUtils.getLocation(pageInfo),
			me = this,
			toc, course,
			courseNavStore,
			date = this.self.dateOverride || new Date();//now

		if (l && l !== ContentUtils.NO_LOCATION) {
			toc = l.toc.querySelector('toc');
			course = toc && toc.querySelector('course');
			courseNavStore = new NextThought.store.course.Navigation({data: toc});

			if (me.el) {
				me.el.mask('Loading...');
			}

			this.queryTiles(
				date, course, l,
				courseNavStore.getCurrentBy(date),
				function (tiles) {
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
	 * @see NextThought.view.course.dashboard.tiles.Tile#getTileFor
	 *
	 * @param {Date} date
	 * @param {Node} course
	 * @param {Object} location
	 * @param {NextThought.model.course.navigation.Node} courseNode
	 * @param {Function} callback
	 * @param {Array} callback.tiles
	 */
	queryTiles: function (date, course, location, courseNode, callback) {
		var NS = NextThought.view.course.dashboard.tiles,
			tiles = [],
			queue = [],
			me = this,
			push = tiles.push;

		Ext.Object.each(NS, function (clsName, cls) {
			var fn = cls.getTileFor;
			if (fn) {
				fn = Ext.bind(fn, cls);
				fn.$test = cls.$className;
				queue.push(fn);
			}
		});


		if(!courseNode){
			console.warn('No course node');
			Ext.callback(callback,me,[tiles]);
			return;
		}


		Ext.each(queue.slice(), function (fn) {
			console.log(fn.$test + " Started");
			fn(date, course, location, courseNode, function finish(o) {
				console.log(fn.$test + " Finished");
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



