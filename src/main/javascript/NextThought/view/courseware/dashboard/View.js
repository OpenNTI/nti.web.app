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

		this.queryTiles(bundle, courseNode, new Date())
			.then(this.applyTiles.bind(this))
			.fail(this.hideDashboard.bind(this));
	},


	queryTiles: function(course, courseNode, date) {
		var widgets = NextThought.view.courseware.dashboard.widgets,
			tilesToLoad = [], deadlinesToLoad = [],
			tilesLoaded, deadlinesLoaded;

		Ext.Object.each(widgets, function(clsName, cls) {
			if (cls.getTiles) {
				tilesToLoad.push(cls.getTiles(course, courseNode, date));
			}

			if (cls.getDeadlines) {
				deadlinesToLoad.push(cls.getDeadlines(course, courseNode, date));
			}
		});

		tilesLoaded = Promise.all(tilesToLoad)
			.then(function(results) {
				if (Ext.isEmpty(results)) {
					return [];
				}

				return results.reduce(function(a, b) {
					return a.concat(b);
				}, []);
			});

		deadlinesLoaded = Promise.all(deadlinesToLoad)
			.then(function(results) {
				if (Ext.isEmpty(results)) {
					return [];
				}

				return results.reduce(function(a, b) {
					return a.concat(b);
				}, []);
			});

		return Promise.all([
					tilesLoaded,
					deadlinesLoaded,
					course.getCompletionStatus()
				])
				.then(function(config) {
					return {
						tiles: config[0],
						deadlines: config[1],
						status: config[2]
					};
				});
	},


	applyTiles: function(config) {
		var tiles = config.tiles,
			deadlines = config.deadlines,
			status = config.status;

		this.add([
			{
				xtype: 'dashboard-deadlines',
				items: deadlines
			},
			{
				xtype: 'dashboard-status',
				status: status
			}
		]);
	},


	hideDashboard: function() {

	}
});
