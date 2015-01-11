Ext.define('NextThought.view.courseware.dashboard.View', {
	extend: 'NextThought.view.courseware.dashboard.AbstractView',
	alias: 'widget.course-dashboard',

	requires: [
		'NextThought.view.courseware.dashboard.tiles.*',
		'NextThought.view.courseware.dashboard.widgets.*'
	],

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},

	STATIC_ORDER: ['announcements', 'assignments', 'lessons'],
	FLOATING_ORDER: ['deadlines', 'progress'],

	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		me.initCustomScrollOn('content');

		me.on({
			'visibility-changed': function(visible) {
				if (visible) {
					AnalyticsUtil.addContext('dashboard', true);
				}
			}
		});
	},


	statics: {
		dateOverride: null//new Date('2013-12-30')
	},


	bundleChanged: function(bundle) {
		var id = bundle && bundle.getId(),
			locationInfo, toc, courseNode;

		if (id !== this.courseId) {
			this.hasItems = true;
			this.tileContainer.removeAll(true);
		}

		if (!bundle || $AppConfig.disableDashboard) {
			return;
		}

		locationInfo = bundle.getLocationInfo();

		if (locationInfo && locationInfo !== ContentUtils.NO_LOCATION) {
			toc = locationInfo.toc.querySelector('toc');
			courseNode = toc && toc.querySelector('course');
		}

		try {
			this.queryTiles(bundle, courseNode, new Date());
		} catch (e) {
			console.error('Failed to load dashboard', e);
			this.hideDashboard();
		}
	},


	queryTiles: function(course, courseNode, date) {
		var widgets = NextThought.view.courseware.dashboard.widgets,
			tiles = [], deadlines = [], staticTiles = {};

		function flatten(results) {
			if (Ext.isEmpty(results)) {
				return [];
			}

			return results.reduce(function(a, b) {
				return a.concat(b);
			}, []);
		}

		Ext.Object.each(widgets, function(clsName, cls) {
			if (cls.getStaticTiles) {
				Ext.apply(staticTiles, cls.getStaticTiles(course, courseNode, date));
			}

			if (cls.getTiles) {
				tiles.push(cls.getTiles(course, courseNode, date));
			}

			if (cls.getDeadlines) {
				deadlines.push(cls.getDeadlines(course, courseNode, date));
			}
		});


		staticTiles.deadline = Ext.widget('dashboard-deadline', {
			loaded: Promise.all(deadlines).then(flatten)
		});

		staticTiles.progress = Ext.widget('dashboard-progress', {
			loaded: course.getCompletionStatus()
		});

		this.addStaticTiles(staticTiles);

		Promise.all(tiles)
			.then(flatten)
			.then(this.addTiles.bind(this));
	},


	addTiles: function(tiles) {
		this.setTiles(tiles);
	},


	addStaticTiles: function(tiles) {
		var staticTiles = [], floatingTiles = [];

		this.STATIC_ORDER.forEach(function(name) {
			if (tiles[name]) {
				staticTiles.push(tiles[name]);
			}
		});


		this.FLOATING_ORDER.forEach(function(name) {
			if (tiles[name]) {
				floatingTiles.push(tiles[name]);
			}
		});

		this.setStaticTiles(staticTiles);
		this.setFloatingTiles(floatingTiles);
	},


	hideDashboard: function() {

	}
});
