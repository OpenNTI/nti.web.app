Ext.define('NextThought.view.courseware.dashboard.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-dashboard',

	cls: 'course-dashboard',


	statics: {
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

			if (diff > threshold) {
				me.scrollChanged();
			}

			me.lastScrollTop = el.dom.scrollTop;
		});
	},


	bundleChanged: function(bundle) {
		var id = bundle && bundle.getId(),
			locationInfo, toc, courseNode;

		this.maxPast = bundle.get('CreatedTime');
		this.maxFuture = '2016-01-01';

		if (id !== this.courseId) {
			this.hasItems = true;
			this.removeAll(true);
		}

		if (!bundle || $AppConfig.disableDashboard) {
			return;
		}

		locationInfo = bundle.getLocationInfo();

		if (locationInfo && locationInfo !== ContentUtils.NO_LOCATION) {
			toc = locationInfo.toc.querySelector('toc');
			courseNode = toc && toc.querySelector('course');
		}

		this.course = bundle;
		this.courseNode = courseNode;
		this.startWeek = TimeUtils.getWeek();
		this.weekToLoad = this.startWeek;

		this.maybeLoadNextWeek({}, true);
		
	},


	queryTiles: function(course, courseNode, startDate, endDate) {
		var widgets = NextThought.view.courseware.dashboard.widgets,
			tiles = [];

		Ext.Object.each(widgets, function(clsName, cls) {
			if (cls.getTiles) {
				tiles.push(cls.getTiles(course, courseNode, startDate, endDate));
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

			if (handler) { changes.push(handler)}
		});

		me.oldScrollChanged = me.scrollChanged;
		me.scrollChanged = function() {};

		changes.forEach(function(handler) { handler.call(null, containerPos); });

		me.scrollChanged = me.oldScrollChanged;
	},


	maybeLoadNextWeek: function(scrollInfo, force) {
		var scrolledDown = scrollInfo.scrollTop + this.loadThreshold > scrollInfo.scrollHeight - scrollInfo.offSetHeight,
			week = this.weekToLoad;

		if (!scrolledDown && !force) { return; }

		this.add({
			xtype: 'dashboard-tile-container',
			loadTiles: this.queryTiles.bind(this, this.course, this.courseNode, week.start, week.end),
			week: week,
			number: this.items.getCount(),
			currentState: NextThought.view.courseware.dashboard.View.IN_BUFFER
		});

		this.weekToLoad = week.getPrevious();
	},


	hideDashboard: function() {

	}
});
