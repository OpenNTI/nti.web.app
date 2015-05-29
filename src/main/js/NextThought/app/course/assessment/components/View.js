Ext.define('NextThought.app.course.assessment.components.View', {
	extend: 'NextThought.common.components.NavPanel',
	alias: 'widget.course-assessment',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	requires: [
		'NextThought.app.course.assessment.components.Navigation',
		'NextThought.app.course.assessment.components.Body',
		'NextThought.app.course.assessment.components.admin.*',
		'NextThought.app.course.assessment.components.student.*'
	],

	navigation: {xtype: 'course-assessment-navigation'},
	body: {xtype: 'course-assessment-body'},


	cls: 'course-assessment-view',

	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.addDefaultRoute('/');

		this.navigation.setTitle(this.title);

		this.mon(this.navigation, 'select-route', this.changeRoute.bind(this));
	},


	bundleChanged: function(bundle) {
		var me = this,
			isSync = (me.currentBundle && me.currentBundle.getId()) === (bundle && bundle.getId());

		function resetView(noAssignments) {
			if (!isSync) { return; }

			me.clearViews();
			me.maybeUnmask();

			if (!noAssignments) {
				me.body.add({
					xtype: 'box',
					autoEl: {
						cn: {
							cls: 'empty-state',
							cn: [
								{cls: 'header', html: getString('NextThought.view.courseware.assessment.View.empty')}
							]
						}
					}
				});
			}
		}

		function getLink(rel, e) { return e.getLink(rel) || bundle.getLink(rel); }

		if (!isSync) {
			me.clearViews();
		}

		me.currentBundle = bundle;

		//if we can't get the wrapper or the bundle shouldn't show assignments
		if (!bundle || !bundle.getWrapper || !bundle.shouldShowAssignments()) {
			return Promise.resolve()
				.then(function() {
					resetView(true);
					delete me.currentBundle;
				});
		}

		return bundle.getWrapper()
			.then(function(enrollment) {
				//if we are reloading for the instance we already have set, don't push views
				if (isSync) { return bundle.getAssignments(); }

				//if we get here and we already have views, don't push more
				if (me.shouldPushViews()) {
					if (enrollment && enrollment.isAdministrative) {
						me.addAdminViews(function(rel) { return getLink(rel, enrollment); });
					} else {
						me.addStudentViews();
					}
				}

				return bundle.getAssignments();
			})
			.then(function(assignments) {
				if (isSync) { return; }

				var items = me.body.items.items || [];

				me.assignmentCollection = assignments;
				me.hasAssignments = !assignments.isEmpty();

				if (!me.hasAssignments) {
					console.debug('The assignments call returned no assignments...');
					resetView(false);
					return;
				}

				//prime
				assignments.getHistory(true);

			})
			.fail(function(reason) {
				console.error('Failed to load assignments:', reason);
				resetView(false);
			});
	},


	getAssignmentList: function() {
		var me = this;

		//apply the assignments data and let it restore state so we can get that order
		return me.assignmentsView.setAssignmentsData(me.assignmentCollection, me.currentBundle, true)
			.then(function() {
				var items = me.assignmentsView.store.getRange() || [];


				items = items.map(function(item) {
					return item.get('item');
				});

				return items;
			});
	},


	maybeMask: function() {
		var el = this.body.el;

		if (el && el.dom) {
			if (!this.finished) {
				el.mask('Loading...', 'loading');
			}
		} else {
			this.on('afterrender', this.maybeMask.bind(this), {single: true});
		}
	},


	maybeUnmask: function() {
		this.finished = true;

		var el = this.body.el;

		if (el && el.dom) {
			el.unmask();
		}
	},


	shouldPushViews: function() {
		return !this.body.items.getCount();
	},


	setActiveItem: function(item) {
		this.navigation.updateActive(item);

		this.callParent(arguments);
	},


	clearViews: function() {
		var items = this.body.items.items || [];

		items.forEach(function(item) {
			if (item.clearAssignmentData) {
				item.clearAssignmentData();
			}
		});

		this.body.removeAll(true);
		this.navigation.clear();

		delete this.notificationsView;
		delete this.assignmentsView;
		delete this.performanceView;
	},


	addChildRouter: function(cmp) {
		this.mixins.Router.addChildRouter.call(this, cmp);
		cmp.pushRoute = this.changeRoute.bind(this);
	},


	addAdminViews: function(getLink) {
		this.notificationsView = this.body.add({
			xtype: 'course-assessment-admin-activity',
			title: getString('NextThought.view.courseware.assessment.View.activity'),
			activityFeedURL: getLink('CourseActivity'),
			route: 'notifications',
			alignNavigation: this.alignNavigation.bind(this)
		});

		this.assignmentsView = this.body.add({
			xtype: 'course-assessment-admin-assignments',
			title: getString('NextThought.view.courseware.assessment.View.assignments'),
			route: '/',
			alignNavigation: this.alignNavigation.bind(this)
		});

		this.performanceView = this.body.add({
			xtype: 'course-assessment-admin-performance',
			title: getString('NextThought.view.courseware.assessment.View.grades'),
			route: '/performance',
			alignNavigation: this.alignNavigation.bind(this)
		});

		//override the push route to use my change route, since my parent is incharge of handling routes
		this.addChildRouter(this.notificationsView);
		this.addChildRouter(this.assignmentsView);
		this.addChildRouter(this.performanceView);

		this.navigation.addItems([
			this.notificationsView,
			this.assignmentsView,
			this.performanceView
		]);
	},


	addStudentViews: function() {
		this.notificationsView = this.body.add({
			xtype: 'course-assessment-activity',
			title: getString('NextThought.view.courseware.assessment.View.activity'),
			route: 'notifications',
			alignNavigation: this.alignNavigation.bind(this)
		});

		this.assignmentsView = this.body.add({
			xtype: 'course-assessment-assignments',
			title: getString('NextThought.view.courseware.assessment.View.assignments'),
			route: '/',
			alignNavigation: this.alignNavigation.bind(this)
		});

		this.performanceView = this.body.add({
			xtype: 'course-assessment-performance',
			title: getString('NextThought.view.courseware.assessment.View.grades'),
			route: '/performance',
			alignNavigation: this.alignNavigation.bind(this)
		});


		this.addChildRouter(this.notificationsView);
		this.addChildRouter(this.assignmentsView);
		this.addChildRouter(this.performanceView);

		this.navigation.addItems([
			this.notificationsView,
			this.assignmentsView,
			this.performanceView
		]);
	},


	showNotifications: function(route, subRoute) {
		if (!this.notificationsView) { return; }

		var me = this;

		me.maybeMask();

		me.setActiveItem(me.notificationsView);

		return me.notificationsView.setAssignmentsData(me.assignmentCollection, me.currentBundle)
			.then(me.maybeUnmask.bind(me))
			.then(me.setTitle.bind(me, me.notificationsView.title))
			.then(me.alignNavigation.bind(me));
	},


	showPerformance: function(route, subRoute) {
		if (!this.performanceView) { return; }

		var me = this;

		me.maybeMask();

		me.setActiveItem(me.performanceView);

		return me.performanceView.setAssignmentsData(me.assignmentCollection, me.currentBundle)
			.then(me.maybeUnmask.bind(me))
			.then(me.setTitle.bind(me, me.performanceView.title))
			.then(me.alignNavigation.bind(me));
	},


	showAssignments: function(route, subRoute) {
		if (!this.assignmentsView) { return; }

		var me = this;

		me.maybeMask();

		me.setActiveItem(me.assignmentsView);

		return me.assignmentsView.setAssignmentsData(me.assignmentCollection, me.currentBundle)
			.then(me.maybeUnmask.bind(me))
			.then(me.setTitle.bind(me, me.assignmentsView.title))
			.then(me.alignNavigation.bind(me));
	},


	showStudentsForAssignment: function(route, subRoute) {
		if (!this.assignmentsView) { return; }

		var me = this,
			assignment = route.precache.assignment,
			id = ParseUtils.decodeFromURI(route.params.assignment);

		if (!assignment || assignment.getId() !== id) {
			assignment = me.assignmentCollection.getItem(id);
		}

		me.maybeMask();

		me.setActiveItem(me.assignmentsView);

		return me.assignmentsView.setAssignmentsData(me.assignmentCollection, me.currentBundle, true)
			.then(me.assignmentsView.showAssignment.bind(me.assignmentsView, assignment))
			.then(me.maybeUnmask.bind(me))
			.then(me.alignNavigation.bind(me));
	}
});
