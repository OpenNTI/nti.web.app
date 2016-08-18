const Ext = require('extjs');
const Globals = require('legacy/util/Globals');
const {encodeForURI, decodeFromURI} = require('nti-lib-ntiids');
const UserRepository = require('../../../../cache/UserRepository');
const ParseUtils = require('../../../../util/Parsing');

require('legacy/app/course/assessment/Actions');
require('../../../../model/User');
require('../../../../common/components/NavPanel');
require('../../../../mixins/Router');
require('./Navigation');
require('./Body');
require('./admin/Activity');
require('./admin/assignments/View');
require('./admin/email/Window');
require('./admin/performance/View');
require('./student/assignments/View');
require('./student/Activity');
require('./student/Performance');
require('nti-lib-ntiids');

module.exports = exports = Ext.define('NextThought.app.course.assessment.components.View', {
	extend: 'NextThought.common.components.NavPanel',
	alias: 'widget.course-assessment',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	navigation: {xtype: 'course-assessment-navigation'},
	body: {xtype: 'course-assessment-body'},
	cls: 'course-assessment-view',

	initComponent: function () {
		this.callParent(arguments);

		this.AssessmentActions = NextThought.app.course.assessment.Actions.create();

		this.initRouter();

		this.addDefaultRoute('/');

		this.navigation.setTitle(this.title);

		this.mon(this.navigation, 'select-route', this.changeRoute.bind(this));

		this.on('activate', this.onActivate.bind(this));
	},

	bundleChanged: function (bundle) {
		var me = this,
			isSync = (me.currentBundle && me.currentBundle.getId()) === (bundle && bundle.getId());

		function resetView (noAssignments) {
			me.clearViews();
			me.maybeUnmask();

			if (!noAssignments) {
				me.body.add(me.createEmptyConfig(me.currentBundle));

				me.alignNavigation();
			}
		}

		function getLink (rel, e) { return e.getLink(rel) || bundle.getLink(rel); }

		if (!isSync) {
			me.clearViews();
		}

		me.currentBundle = bundle;

		//if we can't get the wrapper or the bundle shouldn't show assignments
		if (!bundle || !bundle.getWrapper || !bundle.shouldShowAssignments()) {
			return Promise.resolve()
				.then(function () {
					resetView(true);
					delete me.currentBundle;
				});
		}

		this.bundleLoaded = bundle.getWrapper()
			.then(function (enrollment) {
				//if we are reloading for the instance we already have set, don't push views
				if (isSync) {
					// Check if we need to present empty state.
					if (me.assignmentCollection && me.assignmentCollection.isEmpty()) {
						const emptyCmp = me.body.down('[isEmpty]');
						if (!emptyCmp) {
							resetView();
						}
					}

					return bundle.getAssignments();
				}

				//if we get here and we already have views, don't push more
				if (me.shouldPushViews()) {
					if (enrollment && enrollment.isAdministrative) {
						if (enrollment.isContentEditor && enrollment.isContentEditor()) {
							me.addContentEditorViews();
						}
						else {
							me.addAdminViews(function (rel) { return getLink(rel, enrollment); });
						}
					} else {
						me.addStudentViews();
					}
				}

				return bundle.getAssignments();
			})
			.then(function (assignments) {
				if (isSync) {
					wait()
						.then(me.alignNavigation.bind(me));
					return;
				}

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
			.catch(function (reason) {
				console.error('Failed to load assignments:', reason);
				resetView(false);
			});
	},


	createEmptyConfig (bundle) {
		let cn = [
			{cls: 'header', html: getString('NextThought.view.courseware.assessment.View.empty')}
		];

		if (bundle && bundle.canAddAssignment && bundle.canAddAssignment()) {
			cn.push({
				cls: 'header sub link create',
				html: 'Create an Assignment'
			});
		}


		return {
			xtype: 'box',
			isEmpty: true,
			autoEl: {
				cn: {
					cls: 'empty-state no-assignments',
					cn: cn
				}
			},
			listeners: {
				click: {
					element: 'el',
					fn: (e) => {
						if (e.getTarget('.create')) {
							this.createAssignment();
						}
					}
				}
			}
		};
	},


	onActivate: function () {
		if (!this.rendered) { return; }

		this.alignNavigation();
	},


	getAssignmentList: function () {
		if (!this.assignmentsView) {
			return Promise.resolve(this.assignmentCollection ? this.assignmentCollection.get('Assignments') : []);
		}

		return Promise.resolve(this.assignmentCollection ? this.assignmentCollection
			: this.currentBundle.getAssignments())
			.then(collection => this.assignmentsView.setAssignmentsData(collection, this.currentBundle, true))
			.then(() => {
				const items = this.assignmentsView.store.getRange() || [];
				return items.map(item => item.get('item'));
			});
	},

	getStudentListForAssignment: function (assignment, student) {
		var me = this;

		//apply the assignments data and let it restore state so we can get that order
		return me.assignmentsView.setAssignmentsData(me.assignmentCollection, me.currentBundle, true)
			.then(me.assignmentsView.showAssignment.bind(me.assignmentsView, assignment, student))
			.then(function () {
				var view = me.assignmentsView.getAssignmentView();

				return view.store;
			});
	},

	getAssignmentListForStudent: function (student) {
		var me = this;

		//apply the assignments data and let it restore state so we can get that order
		return me.performanceView.setAssignmentsData(me.assignmentCollection, me.currentBundle, student)
			.then(me.performanceView.showStudent.bind(me.performanceView, student))
			.then(function () {
				var view = me.performanceView.getStudentView(),
					store = view.store;

				if (store.recordsFilledIn) {
					return store;
				}

				return new Promise(function (fulfill, reject) {
					me.mon(store, {
						single: true,
						'records-filled-in': fulfill.bind(null, store)
					});
				});
			});
	},

	maybeMask: function (cmp, isActive, path) {
		var el = this.body.el;

		//if passed an active cmp the want to try to mask itself, let it
		if (cmp && cmp.maybeMask && isActive && cmp.maybeMask(path)) {
			return;
		}

		if (el && el.dom) {
			el.mask('Loading...', 'loading');
		} else {
			this.on('afterrender', this.maybeMask.bind(this), {single: true});
		}
	},

	maybeUnmask: function (cmp, isActive, path) {
		this.finished = true;

		var el = this.body.el;

		if (cmp && cmp.maybeUnmask && isActive) {
			cmp.maybeUnmask(path);
		}

		if (el && el.dom) {
			el.unmask();
		}
	},

	shouldPushViews: function () {
		const count = this.body.items.getCount();
		const emptyCmp = this.body.down('[isEmpty]');

		//If there is only one item and its the empty component, or
		//there aren't any items
		return count === 1 ? !!emptyCmp : !count;
	},

	setActiveItem: function (item, route) {
		this.navigation.updateActive(item, route);

		this.callParent(arguments);
	},

	clearViews: function () {
		var items = this.body.items.items || [];

		items.forEach(function (item) {
			if (item.clearAssignmentsData) {
				item.clearAssignmentsData();
			}
		});

		this.body.removeAll(true);
		this.navigation.clear();

		delete this.notificationsView;
		delete this.assignmentsView;
		delete this.performanceView;
	},

	addChildRouter: function (cmp) {
		this.mixins.Router.addChildRouter.call(this, cmp);
		cmp.pushRoute = this.changeRoute.bind(this);
	},

	addAdminViews: function (getLink) {
		this.isAdmin = true;
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
			alignNavigation: this.alignNavigation.bind(this),
			createAssignment: this.createAssignment.bind(this)
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
			this.assignmentsView,
			this.performanceView,
			this.notificationsView
		]);
	},

	addContentEditorViews: function () {
		this.addStudentViews();

		this.navigation.onceRendered
			.then(() => {
				if (this.performanceView) {
					this.navigation.disabledItem(this.performanceView.xtype);
				}
			});
	},

	addStudentViews: function () {
		this.isAdmin = false;
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
			alignNavigation: this.alignNavigation.bind(this),
			createAssignment: this.createAssignment.bind(this)
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
			this.assignmentsView,
			this.performanceView,
			this.notificationsView
		]);
	},

	showNotifications: function (route, subRoute) {
		this.maybeMask();

		const loaded = this.bundleLoaded || Promise.reject();

		loaded
			.then(() => {
				if (this.notificationsView) {
					this.setActiveItem(this.notificationsView);

					return this.notificationsView.setAssignmentsData(this.assignmentCollection, this.currentBundle);
				}

			})
			.then(this.maybeUnmask.bind(this))
			.then(this.setTitle.bind(this, this.notificationsView.title))
			.then(this.alignNavigation.bind(this));

	},

	showPerformance: function (route, subRoute) {
		const isActiveItem = this.performanceView && this.body.getLayout().getActiveItem() === this.performanceView;
		const student = route.precache.student;

		this.maybeMask(this.performanceView, isActiveItem, 'root');

		const loaded = this.bundleLoaded || Promise.reject();

		loaded
			.then(() => {
				if (this.performanceView) {
					this.setActiveItem(this.performanceView, route.path);

					return this.performanceView.setAssignmentsData(this.assignmentCollection, this.currentBundle, (student && student.getId()));
				}
			})
			.then(() => {
				if (this.performanceView && this.performanceView.showRoot) {
					this.performanceView.showRoot();
				}
			})
			.then(this.maybeUnmask.bind(this, this.performanceView, isActiveItem, 'root'))
			.then(this.setTitle.bind(this, this.performanceView.title))
			.then(this.alignNavigation.bind(this));
	},

	showAssignments: function (route, subRoute) {
		this.maybeMask();

		const loaded = this.bundleLoaded || Promise.reject();

		loaded
			.then(() => {
				if (this.assignmentsView) {
					this.setActiveItem(this.assignmentsView, route.path);

					return this.assignmentsView.setAssignmentsData(this.assignmentCollection, this.currentBundle);
				}
			})
			.then(this.maybeUnmask.bind(this))
			.then(this.setTitle.bind(this, this.assignmentsView.title))
			.then(this.alignNavigation.bind(this));
	},

	showStudentsForAssignment: function (route, subRoute) {
		this.maybeMask();

		const loaded = this.bundleLoaded || Promise.reject();
		const student = route.precache.student;
		const id = decodeFromURI(route.params.assignment);
		let assignment = route.precache.assignment;

		loaded
			.then(() => {
				if (!assignment || assignment.getId() !== id) {
					assignment = this.assignmentCollection.getItem(id);
				}

				if (this.assignmentsView) {
					this.setActiveItem(this.assignmentsView, route.path);

					return this.assignmentsView.setAssignmentsData(this.assignmentCollection, this.currentBundle, true);
				}
			})
			.then(() => {
				this.assignmentsView.showAssignment(assignment, student);
			})
			.then(() => { this.setTitle(assignment.get('title')) })
			.then(this.maybeUnmask.bind(this))
			.then(this.alignNavigation.bind(this));
	},

	showAssignmentsForStudent: function (route, subRoute) {
		this.maybeMask();

		const loaded = this.bundleLoaded || Promise.reject();
		const student = route.params.student && NextThought.model.User.getIdFromURIPart(route.params.student);

		UserRepository.getUser(student)
			.then((user) => {
				this.setTitle(user.getName());
			});

		loaded
			.then(() => {
				if (this.performanceView) {
					this.setActiveItem(this.performanceView, route.path);

					return this.performanceView.setAssignmentsData(this.assignmentCollection, this.currentBundle, student);
				}
			})
			.then(() => {
				this.performanceView.showStudent(student, route.precache);
			})
			.then(this.maybeUnmask.bind(this))
			.then(function () { return wait(); })
			.then(this.alignNavigation.bind(this));
	},


	createAssignment () {
		const bundle = this.currentBundle;

		this.el.mask('Loading...');

		this.AssessmentActions.createAssignmentIn(this.currentBundle)
			.then(Promise.minWait(Globals.WAIT_TIMES.SHORT))
			.then((assignment) => {
				this.appendAssignment(assignment);

				if (this.shouldPushViews()) {
					delete this.currentBundle;

					return this.bundleChanged(bundle)
						.then(() => assignment);
				}

				return assignment;
			})
			.then((assignment) => {
				const title = assignment.get('title');
				let id = assignment.getId();

				id = encodeForURI(id);
				this.pushRoute(title, id + '/edit/', {assignment});
			})
			.always(() => {
				this.el.unmask();
			});
	},


	appendAssignment (assignment) {
		const {assignmentCollection} = this;

		if (assignmentCollection) {
			assignmentCollection.appendAssignment(assignment);
		}
	}
});
