export default Ext.define('NextThought.app.course.info.Index', {
	extend: 'NextThought.common.components.NavPanel',
	alias: 'widget.course-info',

	title: '',

	requires: [
		'NextThought.app.course.info.components.Outline',
		'NextThought.app.course.info.components.Body',
		'NextThought.app.windows.Actions',
		'NextThought.app.library.courses.components.available.CourseDetailWindow'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	navigation: {xtype: 'course-info-outline'},
	body: {xtype: 'course-info-body'},

	initComponent: function() {
		this.callParent(arguments);

		var me = this;
		me.initRouter();
		me.addRoute('/', this.showInfo.bind(me));
		me.addRoute('/instructors', me.showInstructors.bind(me));
		me.addRoute('/support', me.showSupport.bind(me));
		me.addRoute('/roster', me.showRoster.bind(me));
		me.addRoute('/report', me.showReports.bind(me));
		me.on('activate', this.onActivate.bind(me));

		me.WindowActions = NextThought.app.windows.Actions.create();
		me.CourseStore = NextThought.app.library.courses.StateStore.getInstance();
		me.mon(me.navigation,
			{
				'select-route': me.changeRoute.bind(me),
				'show-enrollment': me.showEnrollment.bind(me)
			}
		);

		me.on('show-enrollment', me.showEnrollment.bind(me));
	},

	onActivate: function() {
		if (!this.rendered) { return; }

		this.setTitle(this.title);
		this.alignNavigation();
	},

	bundleChanged: function(bundle) {
		var me = this,
			catalogEntry = bundle && bundle.getCourseCatalogEntry && bundle.getCourseCatalogEntry();

		function update(info, status, showRoster) {
			me.hasInfo = !!info;

			me[me.infoOnly ? 'addCls' : 'removeCls']('info-only');

			me.body.setContent(info, status, showRoster, bundle);
			me.navigation.setContent(info, status, showRoster, me.infoOnly);
		}


		me.hasInfo = !!catalogEntry;
		me.infoOnly = catalogEntry && catalogEntry.get('Preview') === true;
		me.bundle = bundle;

		if (bundle && bundle.getWrapper) {
			return bundle.getWrapper()
				.done(function(e) {
					update(catalogEntry, e.get('Status'), !!e.isAdministrative, me.infoOnly);
				})
				.fail(function() {
					//hide tab?
				});
		}

		return Promise.resolve();
	},

	showInfo: function(route, subRoute) {
		var me = this;

		me.navigation.setActiveItem(route);
		me.body.setActiveItem('info').then(function() {
			me.body.scrollInfoSectionIntoView(route);
		});
	},

	showInstructors: function(route, subRoute) {
		var me = this;

		me.navigation.setActiveItem(route);
		me.body.setActiveItem('info').then(function() {
			me.body.scrollInfoSectionIntoView(route);
		});
	},

	showSupport: function(route, subRoute) {
		var me = this;

		me.navigation.setActiveItem(route);
		me.body.setActiveItem('info').then(function() {
			me.body.scrollInfoSectionIntoView(route);
		});
	},

	showRoster: function(route, subRoute) {
		var me = this;

		me.navigation.setActiveItem(route);
		me.body.setActiveItem('roster').then(function() {
			me.body.scrollRosterIntoView(route, subRoute);
		});
	},

	showReports: function(route, subRoute) {
		var me = this;

		me.navigation.setActiveItem(route);

		me.body.setActiveItem('report').then(function() {
			me.body.scrollReportsIntoView(route, subRoute);
		});
	},

	changeRoute: function(title, route) {
		this.pushRoute(title, route || '/');
	},

	showEnrollment: function(catalogEntry) {
		this.WindowActions.pushWindow(catalogEntry, null, null, {afterClose: this.onWindowClose.bind(this, catalogEntry)});
	},

	onWindowClose: function(catalogEntry) {
		var catalogEntryID = catalogEntry.getId();

		if (catalogEntryID && !this.CourseStore.findEnrollmentForCourse(catalogEntryID)) {
			wait()
				.then(this.pushRootRoute.bind(this, 'Library', '/library'));
		}
	}
});
