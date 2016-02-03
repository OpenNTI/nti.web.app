Ext.define('NextThought.app.course.dashboard.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-dashboard',

	title: 'Activity',

	cls: 'course-dashboard',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	statics: {
		DATE_OVERRIDE: null, //'2015-5-2', 'YYYY-MM-DD'
		OUT_OF_BUFFER: 'out-of-buffer',
		IN_BUFFER: 'in-buffer',
		CURRENT: 'current',
		showTab: function(bundle) {
			return bundle && !bundle.get('Preview');
		}
	},

	loadThreshold: 300,
	bufferThreshold: 1000,

	requires: [
		'NextThought.app.course.dashboard.components.tiles.*',
		'NextThought.app.course.dashboard.components.widgets.*',
		'NextThought.app.course.dashboard.components.TileContainer'
	],

	layout: 'none',

	items: [],

	emptyStateTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{cls: 'empty-state', cn: [
			{cls: 'title', html: getString('NextThought.view.courseware.dashboard.View.EmptyActivityTitle')},
			{cls: 'sub', html: getString('NextThought.view.courseware.dashboard.View.EmptyActivitySubTitle')}
		]}
	])),

	//how much the user has to scroll to trigger a scroll change
	scrollChangeThreshold: 0,


	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		me.refreshDate = new Date(0);
		me.emptiesToRemove = [];

		me.onScroll = me.onScroll.bind(me);

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

		this.lastScrollTop = 0;

		this.initialLoad();
	},


	onScroll: function() {
		var el = this.getScrollTarget(),
			threshold = this.scrollChangeThreshold,
			diff = Math.abs(el.scrollTop - this.lastScrollTop);

		if (diff > threshold && !this.loadingWeek) {
			this.scrollChanged();
		}

		this.lastScrollTop = el.scrollTop;
	},


	onRouteDeactivate: function() {
		window.removeEventListener('scroll', this.onScroll);
	},


	onRouteActivate: function() {
		var me = this;
		this.setTitle(this.title);

		// Cache the scroll position before we reload the tiles.
		// This will help us to make we scroll again to that last position.
		// We can not use lastScrollTop since it changes when the the tiles are removed
		// and added back.
		if (this.lastScrollTop > 0) {
			this.lastScrollCache = this.lastScrollTop;
		}

		this.reloadTiles()
			.then(function() {
				wait().then(me.onScrollToLastScroll.bind(me));
			});

		if (!this.rendered) {
			this.on('afterrender', this.onRouteActivate.bind(this));
			return;
		}

		window.addEventListener('scroll', this.onScroll);
	},


	onScrollToLastScroll: function() {
		if (this.lastScrollCache > 0) {
			window.scrollTo(0, this.lastScrollCache);
			delete this.lastScrollCache;
		}
	},


	getScrollTarget: function() {
		//TODO: figure out how to not have to do a user agent check for this
  		return Ext.isIE11p || Ext.isGecko ? document.documentElement : document.body;
	},


	bundleChanged: function(bundle) {
		var id = bundle && bundle.getId(),
			courseCatalog, date = this.self.DATE_OVERRIDE || new Date();

		//if we are setting our current course don't do anything
		if (id === this.courseId) {
			return Promise.resolve();
		}

		this.hasItems = true;
		this.removeAll(true);


		if (this.emptyState) {
			Ext.destroy(this.emptyState);
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
		var widgets = NextThought.app.course.dashboard.components.widgets,
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
		//wait until we are rendered
		if (!this.rendered) { return; }

		this.maybeLoadNextWeek({}, true);
	},


	maybeFinishInitialLoad: function() {
		//have already done the initial load, or haven't been given a bundle yet
		//don't do the initial load
		if (!this.rendered || this.loaded || !this.course) { return; }

		var el = this.getScrollTarget(),
			height = Math.max(Ext.Element.getViewportHeight(), (el.clientHeight || el.offsetHeight));

		if (!this.weekToLoad || height < el.scrollHeight) {
			this.removeEmpties();
			this.maybeDisplayEmptyState();
			this.loaded = true;
		}
	},


	queryTiles: function(startDate, endDate, isCurrent) {
		var widgets = NextThought.app.course.dashboard.components.widgets,
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
		var el = this.getScrollTarget();

		return {
			offSetHeight: Ext.Element.getViewportHeight(),
			scrollTop: el.scrollTop,
			scrollHeight: el.scrollHeight,
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

		// function getState(pos) {
		// 	var state,
		// 		topFromTop = pos.offsetTop,
		// 		bottomFromTop = (pos.offsetTop + pos.offsetHeight) - containerPos.offSetHeight,
		// 		topFromBottom = pos.offsetTop - containerPos.offSetHeight;
		//
		// 	//if the top of the item is above the top of the container
		// 	//and the bottom if below the top of the container, this is the current item
		// 	if (topFromTop <= 0 && bottomFromTop > 0) {
		// 		state = me.self.CURRENT;
		// 	//else if the top is above the bottom we are in the buffer
		// 	} else if (topFromBottom < 0 && bottomFromTop > 0) {
		// 		state = me.self.IN_BUFFER;
		// 	//else if the bottom of the item is above the top of the container
		// 	} else if (bottomFromTop < 0) {
		// 		//if it is more than the buffer above we are out of the buffer
		// 		if (bottomFromTop < -buffer) {
		// 			state = me.self.OUT_OF_BUFFER;
		// 		//else we are in the buffer
		// 		} else {
		// 			state = me.self.IN_BUFFER;
		// 		}
		// 	//else if the top of the item is below the bottom of the container
		// 	} else if (topFromBottom > 0) {
		// 		//if it is more than the buffer below we are out of the buffer
		// 		if (topFromBottom > buffer) {
		// 			state = me.self.OUT_OF_BUFFER;
		// 		//else we are in the buffer
		// 		} else {
		// 			state = me.self.IN_BUFFER;
		// 		}
		// 	}
		//
		// 	return state;
		// }
		//
		// me.items.each(function(item) {
		// 	var handler = item.parentScrollChanged(getState);
		//
		// 	if (handler) { changes.push(handler); }
		// });
		//
		// me.oldScrollChanged = me.scrollChanged;
		// me.scrollChanged = function() {};
		//
		// changes.forEach(function(handler) { handler.call(null, containerPos); });
		//
		// me.scrollChanged = me.oldScrollChanged;
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
			this.maybeFinishInitialLoad();
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
			currentState: this.self.IN_BUFFER,
			navigateToObject: this.navigateToObject.bind(this)
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


	maybeDisplayEmptyState: function() {
		var tileContainers = this.query('dashboard-tile-container'),
			isEmpty = true;

		Ext.each(tileContainers, function(tileContainer) {
			if (!tileContainer.hasNoTiles) {
				isEmpty = false;
				return false;
			}
		});

		if (isEmpty) {
			this.emptyState = Ext.get(this.emptyStateTpl.append(this.getTargetEl()));
		}
	},


	reloadTiles: function() {
		var tileContainers = this.query('dashboard-tile-container'),
			loadedContainers = [], p;

		Ext.each(tileContainers, function(tileContainer) {
			if (tileContainer.reloadTiles) {
				p = tileContainer.reloadTiles();
				if (p instanceof Promise) {
					loadedContainers.push(p);
				}
			}
		});

		return Promise.all(loadedContainers);
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
		this.maybeFinishInitialLoad();
		this.removeEmpties();
		this.maybeLoadNextWeek(this.getScrollInfo());
	},


	hideDashboard: function() {}
});
