Ext.define('NextThought.app.library.Home', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-home',

	requires: [
		'NextThought.app.library.admin.Current',
		'NextThought.app.library.communities.Current',
		'NextThought.app.library.content.Current',
		'NextThought.app.library.courses.Current',
		'NextThought.app.bundle.Actions',
		'NextThought.app.course.Actions'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',

	cls: 'library-homepage library-page',

	items: [{
		xtype: 'box',
		loadingCmp: true,
		autoEl: {cls: 'loading-mask', cn: {cls: 'load-text', html: 'Loading...'}}
	}],


	initComponent: function() {
		this.callParent(arguments);

		var me = this,
			loadingCmp = me.down('[loadingCmp]'),
			cmps = [
				NextThought.app.library.communities.Current,
				NextThought.app.library.courses.Current,
				NextThought.app.library.admin.Current,
				NextThought.app.library.content.Current
			];

		Promise.all(cmps.map(function(c) {
			return c.shouldShow();
		}))
			.then(function(showing) {
				me.remove(loadingCmp, true);

				cmps.forEach(function(cmp, i) {
					if (showing[i]) {
						me.add({
							xtype: cmp.xtype,
							navigateToAllCourses: me.navigateToAllCourses.bind(me),
							pushRoute: me.pushRoute.bind(me),
							navigateToBundle: me.navigateToBundle.bind(me),
							navigateToCourse: me.navigateToCourse.bind(me),
							navigateToCommunity: me.navigateToCommunity.bind(me)
						});
					}
				});
			})
			.fail(function() {
				me.remove(loadingCmp, true);

				me.add({
					xtype: 'box', autoEl: {cls: 'error-cmp', html: 'Failed to Load Library'}
				});
			});

		me.CourseViewActions = NextThought.app.course.Actions.create();
		me.BundleViewActions = NextThought.app.bundle.Actions.create();
	},

	navigateToBundle: function(bundle, el) {
		var me = this;

		me.BundleViewActions.transitionToBundle(bundle, el)
			.then(function(route) {
				me.pushRootRoute(null, route, {bundle: bundle});
			});
	},


	navigateToCourse: function(enrollment, el) {
		var me = this,
			instance = enrollment.get('CourseInstance');

		me.CourseViewActions.transitionToCourse(instance, el)
			.then(function(route) {
				me.pushRootRoute(null, route, {course: instance});
			});
	},


	navigateToCommunity: function(community, el) {
		var route = community.getProfileUrl();

		if (route) {
			this.pushRootRoute(null, route, {community: community});
		}
	},


	navigateToAllCourses: function() {
		this.pushRoute('All Courses', '/courses/available', {
			closeURL: '/'
		});
	}
});
