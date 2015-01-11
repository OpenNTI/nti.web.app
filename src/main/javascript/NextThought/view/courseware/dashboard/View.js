Ext.define('NextThought.view.courseware.dashboard.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-dashboard',

	cls: 'course-dashboard',

	requires: [
		'NextThought.view.courseware.dashboard.tiles.*',
		'NextThought.view.courseware.dashboard.widgets.*',
		'NextThought.view.courseware.dashboard.TileContainer'
	],

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},

	layout: 'none',

	items: [
		{
			xtype: 'container',
			layout: 'none',
			cls: 'activity-container',
			activityContainer: true,
			items: []
		},
		{
			xtype: 'container',
			layout: 'none',
			cls: 'static-container',
			staticContainer: true,
			items: []
		}
	],


	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		me.initCustomScrollOn('content');

		me.activityContainer = this.down('[activityContainer]');
		me.staticContainer = this.down('[staticContainer]');

		me.on({
			'visibility-changed': function(visible) {
				if (visible) {
					AnalyticsUtil.addContext('dashboard', true);
				}
			}
		});
	},


	statics: {
		dateOverride: null//new Date('2013-12-30'),
	},


	bundleChanged: function(bundle) {
		var id = bundle && bundle.getId(),
			locationInfo, toc, courseNode;

		this.maxPast = bundle.get('CreatedTime');
		this.maxFuture = '2016-01-01';

		if (id !== this.courseId) {
			this.hasItems = true;
			this.activityContainer.removeAll(true);
			this.staticContainer.removeAll(true);
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
		this.week = TimeUtils.getWeek();

		this.queryStaticTiles(bundle, courseNode, this.week.day.toDate())
			.then(this.addStaticTiles.bind(this));

		this.setCurrentWeek(this.week);
		this.setPreviousWeek(this.week.getPrevious());
		this.setNextWeek(this.week.getNext());
	},


	getSortFn: function() {
		return function(a, b) {
			var wA = a.getWeight ? a.getWeight() : 1,
				wB = b.getWeight ? b.getWeight() : 1;

			return wA < wB ? 1 : wA === wB ? 0 : -1;
		};
	},


	queryStaticTiles: function(course, courseNode, date) {
		var widgets = NextThought.view.courseware.dashboard.widgets,
			deadlines = [], staticTiles = [];

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
				staticTiles.push(cls.getStaticTiles(course, courseNode, date));
			}

			if (cls.getDeadlines) {
				deadlines.push(cls.getDeadlines(course, courseNode, date));
			}
		});


		staticTiles.push(Ext.widget('dashboard-deadline', {
			loaded: Promise.all(deadlines).then(flatten)
		}));

		return Promise.resolve(staticTiles);
	},


	queryTiles: function(course, courseNode, startDate, endDate) {
		var widgets = NextThought.view.courseware.dashboard.widgets,
			tiles = [], sortFn = this.getSortFn();

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
					})
					.then(function(cmps) {
						return cmps.sort(sortFn);
					});
	},


	addStaticTiles: function(tiles) {
		tiles = tiles.filter(function(a) { return !!a; });

		tiles.sort(this.getSortFn());

		//this.staticContainer.add(tiles);
	},


	addAt: function(index, week, name) {
		var container = Ext.widget('dashboard-tile-container', {
			loadTiles: this.queryTiles(this.course, this.courseNode, week.start.toDate(), week.end.toDate()),
			week: week,
			name: name
		});

		this.activityContainer.insert(index, container);
	},


	setCurrentWeek: function(week) {
		this.addAt(1, week, 'current');
	},


	setPreviousWeek: function(week) {
		this.addAt(0, week, 'previous');
	},


	setNextWeek: function(week) {
		this.addAt(2, week, 'next');
	},


	getCurrentWeek: function() {
		return this.activityContainer.down('[name=current]');
	},



	getPreviousWeek: function() {
		return this.activityContainer.down('[name=previous]');
	},



	getNextWeek: function() {
		return this.activityContainer.down('[name=next]');
	},


	showPreviousWeek: function() {
		var current = this.getCurrentWeek(),
			previous = this.getPreviousWeek(),
			next = this.getNextWeek();

		next.destroy();

		current.updateName('next');
		previous.updateName('current');

		this.setPreviousWeek(previous.week.getNext());
	},


	showNextWeek: function() {
		var current = this.getCurrentWeek(),
			previous = this.getPreviousWeek(),
			next = this.getNextWeek();

		previous.destroy();

		current.updateName('previous');
		next.updateName('current');

		this.setNextWeek(next.week.getPrevious());
	},


	hideDashboard: function() {

	}
});
