Ext.define('NextThought.view.courseware.dashboard.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-dashboard',

	cls: 'course-dashboard',


	statics: {
		DATE_OVERRIDE: null, //'2015-5-2', 'YYYY-MM-DD'
		OUT_OF_BUFFER: 'out-of-buffer',
		IN_BUFFER: 'in-buffer',
		CURRENT: 'current'
	},

	loadThreshold: 300,
	bufferThreshold: 1000,

	requires: [
		'NextThought.view.courseware.dashboard.tiles.*',
		'NextThought.view.courseware.dashboard.widgets.*',
		'NextThought.view.courseware.dashboard.TileContainer'
	],

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},

	layout: 'none',

	items: [],

	//how much the user has to scroll to trigger a scroll change
	scrollChangeThreshold: 0,

	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		me.initCustomScrollOn('content');

		me.refreshDate = new Date(0);
		me.emptiesToRemove = [];


		me.on({
			'visibility-changed': function(visible) {
				if (visible) {
					AnalyticsUtil.addContext('dashboard', true);
				}
			}
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this,
			threshold = this.scrollChangeThreshold,
			el = me.el;

		me.lastScrollTop = 0;

		me.mon(el, 'scroll', function() {
			var diff = Math.abs(el.dom.scrollTop - me.lastScrollTop);

			if (diff > threshold && !me.loadingWeek) {
				me.scrollChanged();
			}

			me.lastScrollTop = el.dom.scrollTop;
		});

		this.initialLoad();
	},


	bundleChanged: function(bundle) {
		var id = bundle && bundle.getId(),
			courseCatalog, date = this.self.DATE_OVERRIDE || new Date();

		if (id !== this.courseId) {
			this.hasItems = true;
			this.removeAll(true);
		}

		courseCatalog = bundle && bundle.getCourseCatalogEntry && bundle.getCourseCatalogEntry();

		if (!bundle || !bundle.isCourse ||
			$AppConfig.disableDashboard ||
			(courseCatalog && /UCOL/i.test(courseCatalog.getId()))) {
			this.hasItems = false;
			return;
		}

		this.course = bundle;
		this.courseId = id;
		this.currentWeek = TimeUtils.getWeek(date);
		this.weekToLoad = this.currentWeek;
		this.startDate = courseCatalog.get('StartDate');
		//null out values set from a previous bundle
		this.loaded = false;

		//this.addUpcoming(date);

		this.initialLoad();
	},


	queryUpcomingTiles: function(date) {
		var widgets = NextThought.view.courseware.dashboard.widgets,
			course = this.course, tiles = [];

		Ext.Object.each(widgets, function(clsName, cls) {
			if (cls.getUpcomingTiles) {
				tiles.push(cls.getUpcomingTiles(course, date));
			}
		});

		return Promise.all(tiles)
					.then(function(results) {
						if (Ext.isEmpty(results)) {
							return [];
						}

						return results.reduce(function(a, b) {
							return a.concat(b);
						}, []);
					});
	},


	addUpcoming: function(date) {
		this.add({
			xtype: 'dashboard-tile-container',
			loadTiles: this.queryUpcomingTiles.bind(this, date),
			isUpcoming: true
		});
	},


	initialLoad: function() {
		//if we aren't rendered, have already done the initial load, or haven't been given a bundle yet
		//don't do the initial load
		if (!this.rendered || this.loaded || !this.course) { return; }

		if (!this.weekToLoad || this.el.getHeight() < this.el.dom.scrollHeight) {
			this.removeEmpties();
			this.loaded = true;
		} else {
			this.maybeLoadNextWeek({}, true);
		}
	},


	queryTiles: function(startDate, endDate, isCurrent) {
		var widgets = NextThought.view.courseware.dashboard.widgets,
			course = this.course, tiles = [];

		Ext.Object.each(widgets, function(clsName, cls) {
			if (cls.getTiles) {
				tiles.push(cls.getTiles(course, startDate, endDate, isCurrent));
			}
		});

		return Promise.all(tiles)
					.then(function(results) {
						if (Ext.isEmpty(results)) {
							return [];
						}

						return results.reduce(function(a, b) {
							return a.concat(b);
						}, []);
					});
	},


	getScrollInfo: function() {
		return {
			offSetHeight: this.el.dom.offsetHeight,
			scrollTop: this.el.dom.scrollTop,
			scrollHeight: this.el.dom.scrollHeight,
			refreshDate: this.refreshDate,
			force: false
		};
	},


	scrollChanged: function() {
		var me = this,
			changes = [],
			buffer = this.bufferThreshold,
			containerPos = this.getScrollInfo();

		this.maybeLoadNextWeek(containerPos);

		function getState(pos) {
			var state,
				topFromTop = pos.offsetTop - containerPos.scrollTop,
				bottomFromTop = (pos.offsetTop + pos.offsetHeight) - containerPos.scrollTop,
				topFromBottom = pos.offsetTop - (containerPos.offSetHeight + containerPos.scrollTop);

			//if the top of the item is above the top of the container
			//and the bottom if below the top of the container, this is the current item
			if (topFromTop <= 0 && bottomFromTop > 0) {
				state = NextThought.view.courseware.dashboard.View.CURRENT;
			//else if the top is above the bottom we are in the buffer
			} else if (topFromBottom < 0 && bottomFromTop > 0) {
				state = NextThought.view.courseware.dashboard.View.IN_BUFFER;
			//else if the bottom of the item is above the top of the container
			} else if (bottomFromTop < 0) {
				//if it is more than the buffer above we are out of the buffer
				if (bottomFromTop < -buffer) {
					state = NextThought.view.courseware.dashboard.View.OUT_OF_BUFFER;
				//else we are in the buffer
				} else {
					state = NextThought.view.courseware.dashboard.View.IN_BUFFER;
				}
			//else if the top of the item is below the bottom of the container
			} else if (topFromBottom > 0) {
				//if it is more than the buffer below we are out of the buffer
				if (topFromBottom > buffer) {
					state = NextThought.view.courseware.dashboard.View.OUT_OF_BUFFER;
				//else we are in the buffer
				} else {
					state = NextThought.view.courseware.dashboard.View.IN_BUFFER;
				}
			}

			return state;
		}

		this.items.each(function(item) {
			var handler = item.parentScrollChanged(getState);

			if (handler) { changes.push(handler); }
		});

		me.oldScrollChanged = me.scrollChanged;
		me.scrollChanged = function() {};

		changes.forEach(function(handler) { handler.call(null, containerPos); });

		me.scrollChanged = me.oldScrollChanged;
	},


	maybeLoadNextWeek: function(scrollInfo, forced) {
		var scrolledDown = scrollInfo.scrollTop + this.loadThreshold > scrollInfo.scrollHeight - scrollInfo.offSetHeight;

		if (forced || (scrolledDown && !this.loadingWeek)) {
			this.__loadNextWeek();
		}
	},


	__loadNextWeek: function() {
		var me = this, last,
			week = me.weekToLoad,
			isCurrent = week === me.currentWeek,
			tileContainer;

		if (!week) {
			this.removeEmpties();
			last = this.getLastCmp();

			if (last && last.isEmpty()) {
				last.updateRange();
			}

			return;
		}

		tileContainer = this.add({
			xtype: 'dashboard-tile-container',
			loadTiles: this.queryTiles.bind(this, week.start, week.end, isCurrent),
			week: week,
			isCurrent: isCurrent,
			number: this.items.getCount(),
			currentState: NextThought.view.courseware.dashboard.View.IN_BUFFER
		});

		//set a flag to keep us from trying to loading too many weeks at once
		this.loadingWeek = true;

		this.mon(tileContainer, {
			single: true,
			'is-empty': '__emptyContainer',
			'not-empty': '__notEmptyContainer'
		});

		if (!week.start.isBefore(this.startDate)) {
			this.weekToLoad = week.getPrevious();
		} else {
			this.weekToLoad = null;
		}
	},


	getLastCmp: function() {
		var count = this.items.getCount();

		if (count) {
			return this.getComponent(count - 1);
		}
	},


	collapseCmps: function(a, b) {
		a.updateRangeStart(b.getRangeStart());
		b.updateRangeStart = a.updateRangeStart.bind(a);
		this.emptiesToRemove.push(b);
	},


	removeEmpties: function() {
		var me = this;

		this.emptiesToRemove.forEach(function(cmp) {
			if (!cmp.isDestroyed) {
				me.remove(cmp, true);
			}
		});

		this.emptiesToRemove = [];
	},


	__emptyContainer: function(cmp) {
		var index = cmp.number,
			previousCmp = index && this.getComponent(index - 1),
			nextCmp = index && this.getComponent(index + 1);

		if (nextCmp && nextCmp.isEmpty()) {
			this.collapseCmps(cmp, nextCmp);
		}

		if (previousCmp && previousCmp.isEmpty()) {
			this.collapseCmps(previousCmp, cmp);
		} else {
			cmp.updateRange();
		}


		this.loadingWeek = false;
		this.maybeLoadNextWeek({}, true);
	},


	__notEmptyContainer: function(cmp) {
		this.loadingWeek = false;
		this.initialLoad();
		this.removeEmpties();
		this.maybeLoadNextWeek(this.getScrollInfo());
	},


	hideDashboard: function() {

	}
});
