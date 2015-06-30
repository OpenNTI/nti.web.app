Ext.define('NextThought.app.course.Index', {
	extend: 'NextThought.app.content.Index',
	alias: 'widget.course-view-container',

	state_key: 'course_index',

	mixins: {
		Router: 'NextThought.mixins.Router',
		State: 'NextThought.mixins.State'
	},

	requires: [
		'NextThought.app.course.StateStore',
		'NextThought.app.library.courses.StateStore',
		'NextThought.app.course.assessment.Index',
		'NextThought.app.course.dashboard.Index',
		'NextThought.app.content.forum.Index',
		'NextThought.app.course.info.Index',
		'NextThought.app.course.overview.Index',
		'NextThought.app.course.reports.Index',
		'NextThought.app.content.content.Index',
		'NextThought.app.contentviewer.Index',
		'NextThought.app.contentviewer.Actions'
	],

	// cls: 'x-component-course',


	items: [
		{
			xtype: 'course-dashboard',
			id: 'course-dashboard'
		},
		{
			xtype: 'course-overview',
			id: 'course-overview'
		},
		{
			xtype: 'course-assessment-container',
			id: 'course-assessment-container'
		},
		{
			xtype: 'bundle-forum',
			id: 'course-forum'
		},
		{
			xtype: 'course-reports',
			id: 'course-reports'
		},
		{
			xtype: 'course-info',
			id: 'course-info'
		},
		{
			xtype: 'bundle-content',
			id: 'course-content'
		}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.CourseViewStore = NextThought.app.course.StateStore.getInstance();
		this.CourseStore = NextThought.app.library.courses.StateStore.getInstance();
		this.ContentActions = NextThought.app.contentviewer.Actions.create();

		this.getActiveCourse = Promise.reject();

		this.addRoute('/activity', this.showDashboard.bind(this));
		this.addRoute('/lessons', this.showOverview.bind(this));
		this.addRoute('/assignments', this.showAssignments.bind(this));
		this.addRoute('/discussions', this.showDiscussions.bind(this));
		this.addRoute('/reports', this.showReports.bind(this));
		this.addRoute('/info', this.showInfo.bind(this));
		this.addRoute('/content', this.showContent.bind(this));

		this.addObjectHandler(NextThought.model.PageInfo.mimeType, this.getPageInfoRoute.bind(this));
		this.addObjectHandler(NextThought.model.RelatedWork.mimeType, this.getRelatedWorkRoute.bind(this));
		this.addObjectHandler([
			NextThought.model.assessment.Assignment.mimeType,
			NextThought.model.assessment.TimedAssignment.mimeType
		], this.getAssignmentRoute.bind(this));
		this.addObjectHandler('application/vnd.nextthought.courses.courseoutlinecontentnode', this.getLessonRoute.bind(this));

		this.addDefaultRoute('/activity');
	},


	setActiveCourse: function(ntiid, course) {
		var me = this;

		ntiid = ntiid.toLowerCase();

		//if we are setting my current course no need to do anything
		if (me.activeBundle && (me.activeBundle.getId() || '').toLowerCase() === ntiid) {
			me.getActiveCourse = Promise.resolve(me.activeBundle);
		} else {
			me.clearRouteStates();
			me.getActiveCourse = me.CourseStore.onceLoaded()
				.then(function() {
					var current;
					//if the course was cached, no need to look for it
					if (course && (course.getId() || '').toLowerCase() === ntiid) {
						current = course;
					} else {
						//find which ever course whose ntiid matches
						current = me.CourseStore.findCourseBy(function(enrollment) {
							var instance = enrollment.get('CourseInstance'),
								instanceId = instance.getId() || '',
								enrollmentId = enrollment.get('NTIID') || '';

							return instanceId.toLowerCase() === ntiid || enrollmentId.toLowerCase() === ntiid;
						});
					}

					if (!current) {
						return Promise.reject('No Course found for:', ntiid);
					}

					if (current instanceof NextThought.model.courses.CourseInstanceAdministrativeRole) {
						me.isAdmin = true;
					} else {
						me.isAdmin = false;
					}

					me.activeBundle = current.get('CourseInstance') || current;

					return current;
				});
		}

		return me.getActiveCourse;
	},


	clearRouteStates: function() {
		delete this.dashboardRoute;
		delete this.overviewRoute;
		delete this.assignmentRoute;
		delete this.discussionsRoute;
	},


	applyState: function(state) {
		var bundle = this.activeBundle,
			active = state.active,
			course = NextThought.app.course,
			tabs = [];

		/**
		 * Wether or not a view should show its tab
		 * if the view doesn't have a static showTab then show it,
		 * otherwise return the value of showTab
		 * @param  {Object} index the view to check
		 * @return {Boolean}      show the tab or not
		 */
		function showTab(index) {
			return !index.showTab || index.showTab(bundle);
		}

		if (showTab(course.dashboard.Index)) {
			tabs.push({
				text: getString('NextThought.view.content.View.dashboardtab', 'Activity'),
				route: 'activity',
				subRoute: this.dashboardRoute,
				title: 'Activity',
				active: active === 'course-dashboard'
			});
		}

		if (showTab(course.overview.Index)) {
			tabs.push({
				text: getString('NextThought.view.content.View.lessontab', 'Lessons'),
				route: 'lessons',
				subRoute: this.overviewRoute,
				title: 'Lessons',
				active: active === 'course-overview'
			});
		}

		if (showTab(course.assessment.Index)) {
			tabs.push({
				text: getString('NextThought.view.content.View.assessmenttab', 'Assignments'),
				route: 'assignments',
				subRoute: this.assignmentRoute,
				title: 'Assignments',
				active: active === 'course-assessment-container'
			});
		}

		if (showTab(NextThought.app.content.forum.Index)) {
			tabs.push({
				text: getString('NextThought.view.content.View.discussiontab', 'Discussions'),
				route: 'discussions',
				subRoute: this.discussionsRoute,
				title: 'Discussions',
				active: active === 'bundle-forum'
			});
		}

		if (showTab(course.reports.Index)) {
			tabs.push({
				text: getString('NextThought.view.content.View.reporttab', 'Reports'),
				route: 'reports',
				title: 'Reports',
				active: active === 'course-reports'
			});
		}

		if (showTab(course.info.Index)) {
			tabs.push({
				text: getString('NextThought.view.content.View.infotab'),
				route: 'info',
				title: 'Info',
				active: active === 'course-info'
			});
		}

		this.navigation.setTabs(tabs);
	},


	setPreview: function() {
		var me = this;

		this.navigation.setTabs([]);

		return me.setActiveItem('course-info');
	},


	setActiveView: function() {
		if (this.activeBundle.get('Preview')) {
			return this.setPreview();
		}

		return this.callParent(arguments);
	},


	showDashboard: function(route, subRoute) {
		this.dashboardRoute = subRoute;

		return this.setActiveView('course-dashboard', [
				'course-overview',
				'course-assessment-container',
				'bundle-forum',
				'course-reports',
				'course-info'
			]);
	},


	showOverview: function(route, subRoute) {
		this.overviewRoute = subRoute;

		return this.setActiveView('course-overview', [
				'course-dashboard',
				'course-assessment-container',
				'bundle-forum',
				'course-reports',
				'course-info'
			]).then(function(item) {
				if (item.handleRoute) {
					return item.handleRoute(subRoute, route.precache);
				}
			});
	},


	showAssignments: function(route, subRoute) {
		this.assignmentRoute = subRoute;

		return this.setActiveView('course-assessment-container', [
				'course-dashboard',
				'course-overview',
				'bundle-forum',
				'course-reports',
				'course-info'
			]).then(function(item) {
				if (item.handleRoute) {
					return item.handleRoute(subRoute, route.precache);
				}
			});
	},


	showDiscussions: function(route, subRoute) {
		this.discussionsRoute = subRoute;

		return this.setActiveView('bundle-forum', [
				'course-dashboard',
				'course-overview',
				'course-assessment-container',
				'course-reports',
				'course-info'
			]).then(function(item) {
				if (item.handleRoute) {
					return item.handleRoute(subRoute, route.precache);
				}
			});
	},


	showReports: function(route, subRoute) {
		this.reportsRoute = subRoute;

		return this.setActiveView('course-reports', [
				'course-dashboard',
				'course-overview',
				'course-assessment-container',
				'bundle-forum',
				'course-info'
			]);
	},


	showInfo: function(route, subRoute) {
		this.reportsRoute = subRoute;

		return this.setActiveView('course-info', [
				'course-dashboard',
				'course-overview',
				'course-assessment-container',
				'bundle-forum',
				'course-reports'
			]).then(function(item) {
				if (item && item.handleRoute) {
					item.handleRoute(subRoute, route.precache);
				}
			});
	},


	showContent: function(route, subRoute) {
		return this.setActiveView('bundle-content', [
				'course-dashboard',
				'course-overview',
				'course-assessment-container',
				'bundle-forum',
				'course-reports',
				'course-info'
			], 'course-overview').then(function(item) {
				item.handleRoute(subRoute, route.precache);
			});
	},


	getPageInfoRoute: function(obj) {
		var id = obj.getId ? obj.getId() : obj.NTIID;

		id = ParseUtils.encodeForURI(id);

		return {
			route: '/content/' + id,
			title: obj.get ? obj.get('label') : obj.label,
			precache: {
				pageInfo: obj.isModel ? obj : null
			}
		};
	},


	getRelatedWorkRoute: function(obj) {
		var id = obj.getId();

		id = ParseUtils.encodeForURI(id);

		return {
			route: '/content/' + id,
			title: obj.get('label'),
			precache: {
				relatedWork: obj
			}
		};

	},


	getAssignmentRoute: function(obj) {
		var id = obj.getId ? obj.getId() : obj.NTIID,
			route;

		id = ParseUtils.encodeForURI(id);

		route = '/assignments/' + id;

		return {
			route: route,
			title: obj.get ? obj.get('title') : obj.title,
			precache: {
				assignment: obj.isModel ? obj : null
			}
		};
	},


	getLessonRoute: function(obj) {
		var id = obj.getId ? obj.getId() : obj.NTIID,
			route;

		id = ParseUtils.encodeForURI(id);

		route = '/lessons/' + id;

		return {
			route: route,
			title: obj.get ? obj.get('title') : obj.title,
			precache: {
				lesson: obj.isModel ? obj : null
			}
		};
	},


	getRouteForPath: function(path) {
		var root = path[0],
			subPath = path.slice(1),
			route = '';

		if (root.isForum) {
			route = this.getRouteForForum(root, subPath);
		} else if (root instanceof NextThought.model.assessment.Assignment) {
			route = this.getRouteForAssignment(root, subPath);
		}

		return route;
	},


	getRouteForAssignment: function(assignment, path) {
		var cmp = this.down('course-assessment-container'),
			route = '/assignments/';

		path.unshift(assignment);

		return route + Globals.trimRoute(cmp.getRouteForPath(path));
	}
});
