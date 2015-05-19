Ext.define('NextThought.app.course.Index', {
	extend: 'NextThought.app.content.Index',
	alias: 'widget.course-view-container',

	mixins: {
		Router: 'NextThought.mixins.Router',
		State: 'NextThought.mixins.State'
	},

	requires: [
		'NextThought.app.course.StateStore',
		'NextThought.app.library.courses.StateStore',
		'NextThought.app.navigation.Actions',
		'NextThought.app.course.assessment.Index',
		'NextThought.app.course.dashboard.Index',
		'NextThought.app.course.forum.Index',
		'NextThought.app.course.info.Index',
		'NextThought.app.course.overview.Index',
		'NextThought.app.course.reports.Index',
		'NextThought.app.course.content.Index',
		'NextThought.app.contentviewer.Index',
		'NextThought.app.contentviewer.Actions'
	],

	// cls: 'x-component-course',


	cmp_map: {},


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
			xtype: 'course-forum',
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
			xtype: 'course-content',
			id: 'course-content'
		}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.CourseViewStore = NextThought.app.course.StateStore.getInstance();
		this.CourseStore = NextThought.app.library.courses.StateStore.getInstance();
		this.NavigationActions = NextThought.app.navigation.Actions.create();
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

		this.addDefaultRoute('/activity');

		this.on({
			'beforedeactivate': this.onBeforeDeactivate.bind(this),
			'deactivate': this.onDeactivate.bind(this)
		});
	},


	onBeforeDeactivate: function() {
		var current = this.getLayout().getActiveItem();

		return current.fireEvent('beforedeactivate');
	},


	onDeactivate: function() {
		var current = this.getLayout().getActiveItem();

		return current.fireEvent('deactivate');
	},


	onBack: function() {
		this.pushRootRoute('', '/');
	},


	onTabChange: function(title, route) {
		this.pushRoute('', route);
	},


	getRouteTitle: function() {
		if (!this.activeCourse) { return ''; }

		var data = this.activeCourse.asUIData();

		return data.title;
	},


	setActiveCourse: function(ntiid, course) {
		var me = this;

		ntiid = ntiid.toLowerCase();

		//if we are setting my current course no need to do anything
		if (me.activeCourse && (me.activeCourse.getId() || '').toLowerCase() === ntiid) {
			me.getActiveCourse = Promise.resolve(me.activeCourse);
		} else {
			me.getActiveCourse = me.CourseStore.onceLoaded()
				.then(function() {
					var course;
					//if the course was cached, no need to look for it
					if (course && course.getId() === ntiid) {
						course = me.CourseViewStore.activeCourse;
					} else {
						//find which ever course whose ntiid matches
						course = me.CourseStore.findCourseBy(function(enrollment) {
							var instance = enrollment.get('CourseInstance'),
								instanceId = instance.getId() || '',
								enrollmentId = enrollment.get('NTIID') || '';

							return instanceId.toLowerCase() === ntiid || enrollmentId.toLowerCase() === ntiid;
						});
					}

					if (!course) {
						return Promise.reject('No Course found for:', ntiid);
					}

					me.activeCourse = course.get('CourseInstance') || course;

					return course;
				});
		}

		return me.getActiveCourse;
	},


	getItem: function(xtype) {
		var cmp = this.cmp_map[xtype];

		if (!cmp) {
			cmp = this.cmp_map[xtype] = this.down(xtype);
			this.addChildRouter(cmp);
			cmp.courseContainer = this;
		}

		return cmp;
	},


	setItemBundle: function(xtypes, bundle) {
		if (!Ext.isArray(xtypes)) {
			xtypes = [xtypes];
		}

		bundle = bundle || this.activeCourse;

		var me = this,
			activeCourse = this.activeCourse;

		xtypes = xtypes.map(function(xtype) {
			var item = me.getItem(xtype);

			return item.bundleChanged && item.bundleChanged(bundle);
		});

		return Promise.all(xtypes);
	},


	setActiveItem: function(xtype) {
		var layout = this.getLayout(),
			item = this.getItem(xtype),
			current = layout.getActiveItem();

		if (current === item) {
			item.fireEvent('activate');
		}


		this.getLayout().setActiveItem(item);
	},


	applyState: function(state) {
		var bundle = this.activeCourse,
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
				title: 'Activity',
				active: active === 'course-dashboard'
			});
		}

		if (showTab(course.overview.Index)) {
			tabs.push({
				text: getString('NextThought.view.content.View.lessontab', 'Lessons'),
				route: state.lessonRoute || 'lessons',
				title: 'Lessons',
				active: active === 'course-overview'
			});
		}

		if (showTab(course.assessment.Index)) {
			tabs.push({
				text: getString('NextThought.view.content.View.assessmenttab', 'Assignments'),
				route: 'assignments/notifications',
				title: 'Assignments',
				active: active === 'course-assessment-container'
			});
		}

		if (showTab(course.forum.Index)) {
			tabs.push({
				text: getString('NextThought.view.content.View.discussiontab', 'Discussions'),
				route: 'discussions',
				title: 'Discussions',
				active: active === 'course-forum'
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


	__loadCourse: function() {
		var bundle = this.activeCourse;

		this.NavigationActions.updateNavBar({
			cmp: this.getNavigation()
		});

		this.NavigationActions.setActiveContent(bundle);
	},


	setPreview: function() {
		var me = this;

		this.navigation.setTabs([]);

		return me.setActiveItem('course-info');
	},


	/**
	 * Set up the active tab
	 * @param  {String} active   xtype of the active tab
	 * @param  {Array} inactive xtypes of the other views to set the active course on, but not wait
	 * @return {Promise}         fulfills when the tab is set up
	 */
	__setActiveView: function(active, inactive, tab) {
		var me = this;

		if (me.activeCourse.get('Preview')) {
			return me.setPreview();
		}

		me.__loadCourse();

		me.navigation.bundleChanged(me.activeCourse);

		me.applyState({
			active: tab || active
		});

		function updateInactive() {
			wait().then(me.setItemBundle.bind(me, inactive, me.activeCourse));
		}

		return me.setItemBundle(active, me.activeCourse)
				.then(me.setActiveItem.bind(me, active))
				.then(function() {
					var item = me.getItem(active);

					updateInactive();
					return item;
				})
				.fail(function(reason) {
					me.replaceRoute('Info', 'info');
				});
	},


	showDashboard: function(route, subRoute) {
		return this.__setActiveView('course-dashboard', [
				'course-overview',
				'course-assessment-container',
				'course-forum',
				'course-reports',
				'course-info'
			]);
	},


	showOverview: function(route, subRoute) {
		return this.__setActiveView('course-overview', [
				'course-dashboard',
				'course-assessment-container',
				'course-forum',
				'course-reports',
				'course-info'
			]).then(function(item) {
				if (item.handleRoute) {
					return item.handleRoute(subRoute, route.precache);
				}
			});
	},


	showAssignments: function(route, subRoute) {
		return this.__setActiveView('course-assessment-container', [
				'course-dashboard',
				'course-overview',
				'course-forum',
				'course-reports',
				'course-info'
			]).then(function(item) {
				if (item.handleRoute) {
					return item.handleRoute(subRoute, route.precache);
				}
			});
	},


	showDiscussions: function(route, subRoute) {
		return this.__setActiveView('course-forum', [
				'course-dashboard',
				'course-overview',
				'course-assessment-container',
				'course-reports',
				'course-info'
			]);
	},


	showReports: function(route, subRoute) {
		return this.__setActiveView('course-reports', [
				'course-dashboard',
				'course-overview',
				'course-assessment-container',
				'course-forum',
				'course-info'
			]);
	},


	showInfo: function(route, subRoute) {
		return this.__setActiveView('course-info', [
				'course-dashboard',
				'course-overview',
				'course-assessment-container',
				'course-forum',
				'course-reports'
			]).then( function(item) {
				if (item && item.handleRoute) {
					item.handleRoute(subRoute, route.precache);
				}
			});
	},


	showContent: function(route, subRoute) {
		return this.__setActiveView('course-content', [
				'course-dashboard',
				'course-overview',
				'course-assessment-container',
				'course-forum',
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
		}
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

	}
});
