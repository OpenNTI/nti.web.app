var Ext = require('extjs');
var Globals = require('../../util/Globals');
var ParseUtils = require('../../util/Parsing');
var ContentIndex = require('../content/Index');
var MixinsRouter = require('../../mixins/Router');
var MixinsState = require('../../mixins/State');
var CourseStateStore = require('./StateStore');
var CoursesStateStore = require('../library/courses/StateStore');
var AssessmentIndex = require('./assessment/Index');
var DashboardIndex = require('./dashboard/Index');
var ForumIndex = require('../content/forum/Index');
var InfoIndex = require('./info/Index');
var OverviewIndex = require('./overview/Index');
var ReportsIndex = require('./reports/Index');
var ResourcesIndex = require('./resources/Index');
var ContentIndex = require('../content/content/Index');
var TimelineWindow = require('../content/timeline/Window');
var ContentviewerIndex = require('../contentviewer/Index');
var ContentviewerActions = require('../contentviewer/Actions');
const { encodeForURI } = require('nti-lib-ntiids');
const Topic = require('legacy/model/forums/Topic');
const HeadlineTopic = require('legacy/model/forums/HeadlineTopic');
const DFLHeadlineTopic = require('legacy/model/forums/DFLHeadlineTopic');
const ContentHeadlineTopic = require('legacy/model/forums/ContentHeadlineTopic');
const CommunityHeadlineTopic = require('legacy/model/forums/CommunityHeadlineTopic');
const Video = require('legacy/model/Video');
const Assignment = require('legacy/model/assessment/Assignment');
const DiscussionAssignment = require('legacy/model/assessment/DiscussionAssignment');
const User = require('legacy/model/User');
const {getService} = require('nti-web-client');

const DASHBOARD = 'course-dashboard';
const OVERVIEW = 'course-overview';
const ASSESSMENT = 'course-assessment-container';
const FORUM = 'bundle-forum';
const REPORTS = 'course-reports';
const INFO = 'course-info';
const RESOURCES = 'course-resources';



module.exports = exports = Ext.define('NextThought.app.course.Index', {
	extend: 'NextThought.app.content.Index',
	alias: 'widget.course-view-container',
	state_key: 'course_index',

	mixins: {
		Router: 'NextThought.mixins.Router',
		State: 'NextThought.mixins.State'
	},

	// cls: 'x-component-course',


	items: [
		{
			xtype: DASHBOARD,
			id: DASHBOARD
		},
		{
			xtype: OVERVIEW,
			id: OVERVIEW
		},
		{
			xtype: ASSESSMENT,
			id: ASSESSMENT
		},
		{
			xtype: FORUM,
			id: 'course-forum'
		},
		{
			xtype: REPORTS,
			id: REPORTS
		},
		{
			xtype: INFO,
			id: INFO
		},
		{
			xtype: RESOURCES,
			id: RESOURCES
		},
		{
			xtype: 'bundle-content',
			courseLevel: true,
			id: 'course-content',
			hideHeader: true
		}
	],

	initComponent: function () {
		this.callParent(arguments);

		this.initRouter();

		this.CourseViewStore = NextThought.app.course.StateStore.getInstance();
		this.CourseStore = NextThought.app.library.courses.StateStore.getInstance();
		this.ContentActions = NextThought.app.contentviewer.Actions.create();

								//Get a "handled" rejected promise.
		this.getActiveCourse = ((x) => (x = Promise.reject(), x.catch(()=>{}), x)());

		this.addRoute('/activity', this.showDashboard.bind(this));
		this.addRoute('/lessons', this.showOverview.bind(this));
		this.addRoute('/assignments', this.showAssignments.bind(this));
		this.addRoute('/discussions', this.showDiscussions.bind(this));
		this.addRoute('/reports', this.showReports.bind(this));
		this.addRoute('/info', this.showInfo.bind(this));
		this.addRoute('/content', this.showContent.bind(this));
		//TODO: add a /video route to show the grid view
		this.addRoute('/videos/:id', this.showVideos.bind(this));
		this.addRoute('/resources', this.showResources.bind(this));

		this.addObjectHandler(Assignment.mimeType, this.getAssignmentRoute.bind(this));
		this.addObjectHandler(DiscussionAssignment.mimeType, this.getAssignmentRoute.bind(this));
		this.addObjectHandler('application/vnd.nextthought.courses.courseoutlinecontentnode', this.getLessonRoute.bind(this));

		this.addObjectHandler([
			Topic.mimeType,
			HeadlineTopic.mimeType,
			DFLHeadlineTopic.mimeType,
			ContentHeadlineTopic.mimeType,
			CommunityHeadlineTopic.mimeType
		], this.getTopicRoute.bind(this));

		this.addDefaultRoute('/lessons');
	},

	onQuickLinkNav: function (title, route) {
		var activeRoute = this.getCurrentRoute() || '';

		route = Globals.trimRoute(route) + '/' + Globals.trimRoute(activeRoute);

		this.pushRootRoute(title, route);
	},

	afterRoute: function (route) {
		this.CourseViewStore.markRouteFor(this.activeBundle.getId(), route);
	},

	gotoResources () {
		this.pushRoute('Resources', '/resources');
	},


	gotoResource (reading) {
		reading.NTIID ? this.pushRoute('', `/content/${encodeForURI(reading.NTIID)}/edit`) : this.pushRoute('', `/content/${encodeForURI(reading.get('NTIID'))}/edit`);

		this.setTitle(reading.DCTitle);
	},


	setActiveCourse: function (ntiid, course) {
		var me = this;

		//if we are setting my current course no need to do anything
		if (me.activeBundle && (me.activeBundle.getId() || '') === ntiid) {
			me.getActiveCourse = Promise.resolve(me.activeBundle);
		} else {
			me.clearRouteStates();

			me.getActiveCourse = new Promise((fulfill) => {
				if (course) {
					fulfill(course);
				} else {
					Service.getObject(ntiid)
						.then(c => c.prepareData())
						.then(fulfill)
						.catch(() => fulfill(null));
				}
			}).then((current) => {
				if (!current) {
					return Promise.reject('No Course found for: ', ntiid);
				}

				if (current instanceof NextThought.model.courses.CourseInstanceAdministrativeRole) {
					this.isAdmin = true;
				} else {
					this.isAdmin = false;
				}

				this.activeBundle = current;

				current.getWrapper()
					.then((enrollment) => {
						this.CourseStore.addCourse(enrollment);
					});

				return current;
			});
		}

		return me.getActiveCourse;
	},


	applyState: function (state) {
		var bundle = this.activeBundle,
			active = state.active,
			course = NextThought.app.course,
			tabs = [];

		/**
		 * Wether or not a view should show its tab
		 * if the view doesn't have a static showTab then show it,
		 * otherwise return the value of showTab
		 * @param  {Object} index the view to check
		 * @return {Boolean}	  show the tab or not
		 */
		function showTab (index) {
			return !index.showTab || index.showTab(bundle);
		}

		if (showTab(course.dashboard.Index)) {
			tabs.push({
				text: getString('NextThought.view.content.View.dashboardtab', 'Activity'),
				route: 'activity',
				root: this.getRoot(DASHBOARD),
				subRoute: this.getCmpRouteState(DASHBOARD),
				title: 'Activity',
				active: active === DASHBOARD
			});
		}

		if (showTab(course.overview.Index)) {
			tabs.push({
				text: getString('NextThought.view.content.View.lessontab', 'Lessons'),
				route: 'lessons',
				root: this.getRoot(OVERVIEW),
				subRoute: this.getCmpRouteState(OVERVIEW),
				title: 'Lessons',
				active: active === OVERVIEW
			});
		}

		if (showTab(course.assessment.Index)) {
			tabs.push({
				text: getString('NextThought.view.content.View.assessmenttab', 'Assignments'),
				route: 'assignments',
				root: this.getRoot(ASSESSMENT),
				subRoute: this.getCmpRouteState(ASSESSMENT),
				title: 'Assignments',
				active: active === ASSESSMENT
			});
		}

		if (showTab(NextThought.app.content.forum.Index)) {
			tabs.push({
				text: getString('NextThought.view.content.View.discussiontab', 'Discussions'),
				route: 'discussions',
				root: this.getRoot(FORUM),
				subRoute: this.getCmpRouteState(FORUM),
				title: 'Discussions',
				active: active === FORUM
			});
		}

		if (showTab(course.reports.Index)) {
			tabs.push({
				text: getString('NextThought.view.content.View.reporttab', 'Reports'),
				route: 'reports',
				root: this.getRoot(REPORTS),
				title: 'Reports',
				active: active === REPORTS
			});
		}

		if (showTab(course.info.Index)) {
			tabs.push({
				text: getString('NextThought.view.content.View.infotab'),
				route: 'info',
				root: this.getRoot(INFO),
				title: 'Info',
				active: active === INFO
			});
		}

		this.navigation.setTabs(tabs);
	},

	setPreview: function () {
		var me = this;

		this.navigation.setTabs([]);

		return me.setActiveItem(INFO);
	},

	setActiveView: function (active, inactive, tab, navBarConfig, whiteMask) {
		var bundle = this.activeBundle,
			base = NextThought.app.course,
			tabs = [
				base.dashboard.Index,
				base.overview.Index,
				base.assessment.Index,
				NextThought.app.content.forum.Index,
				base.reports.Index,
				base.info.Index
			], activeCmp;

		tabs = tabs.reduce(function (acc, cmp) {
			acc[cmp.xtype] = cmp;

			return acc;
		}, {});

		inactive = inactive.filter(function (xtype) {
			var cmp = tabs[xtype];

			return cmp && (!cmp.showTab || cmp.showTab(bundle));
		});

		activeCmp = tabs[tab || active];

		if (!activeCmp || (activeCmp.showTab && !activeCmp.showTab(bundle))) {
			active = inactive.shift();
		}

		return this.callParent([active, inactive, tab, navBarConfig, whiteMask]);
	},

	showDashboard: function (route, subRoute) {
		this.setCmpRouteState(DASHBOARD, subRoute);

		return this.setActiveView(DASHBOARD, [
			OVERVIEW,
			ASSESSMENT,
			FORUM,
			REPORTS,
			INFO
		]).then(function (item) {
			if (item && item.handleRoute) {
				return item.handleRoute(subRoute, route.precache);
			}
		});
	},

	showOverview: function (route, subRoute) {
		this.previousLessonRoute = this.currentFullRoute;
		this.setCmpRouteState(OVERVIEW, subRoute);

		return this.setActiveView(OVERVIEW, [
			DASHBOARD,
			ASSESSMENT,
			FORUM,
			REPORTS,
			INFO
		]).then((item) => {
			if (item && item.handleRoute) {
				item.gotoResources = () => this.gotoResources();

				return item.handleRoute(subRoute, route.precache)
						.then();
			}
		});
	},

	showAssignments: function (route, subRoute) {
		this.setCmpRouteState(ASSESSMENT, subRoute);

		if (!NextThought.app.course.assessment.Index.showTab(this.activeBundle)) {
			return this.showOverview(route, '');
		}

		return this.setActiveView(ASSESSMENT, [
			DASHBOARD,
			OVERVIEW,
			FORUM,
			REPORTS,
			INFO
		]).then(function (item) {
			if (item && item.handleRoute) {
				return item.handleRoute(subRoute, route.precache);
			}
		});
	},

	showDiscussions: function (route, subRoute) {
		this.setCmpRouteState(FORUM, subRoute);

		return this.setActiveView(FORUM, [
			DASHBOARD,
			OVERVIEW,
			ASSESSMENT,
			REPORTS,
			INFO
		]).then(function (item) {
			if (item && item.handleRoute) {
				return item.handleRoute(subRoute, route.precache);
			}
		});
	},

	showReports: function (route, subRoute) {
		this.setCmpRouteState(REPORTS, subRoute);

		return this.setActiveView(REPORTS, [
			DASHBOARD,
			OVERVIEW,
			ASSESSMENT,
			FORUM,
			INFO
		]);
	},

	showInfo: function (route, subRoute) {
		this.setCmpRouteState(INFO, subRoute);

		return this.setActiveView(INFO, [
			DASHBOARD,
			OVERVIEW,
			ASSESSMENT,
			FORUM,
			REPORTS
		]).then(function (item) {
			if (item && item.handleRoute) {
				item.handleRoute(subRoute, route.precache);
			}
		});
	},

	showResources (route, subRoute) {
		const prevRoute = this.previousLessonRoute;
		const navBarConfig = {
			hideBranding: true,
			noRouteOnSearch: true,
			hideNavCmp: true,
			onBack: () => {
				this.pushRoute('', prevRoute || '');
			}
		};

		this.setCmpRouteState(RESOURCES, subRoute);

		return this.setActiveView(RESOURCES, [
			DASHBOARD,
			OVERVIEW,
			ASSESSMENT,
			FORUM,
			REPORTS
		], OVERVIEW, navBarConfig, true).then((item) => {
			if (item && item.handleRoute) {
				item.gotoResource = (id) => this.gotoResource(id);

				return item.handleRoute(subRoute, route.precache);
			}
		});
	},

	showContent: function (route, subRoute) {
		return this.setActiveView('bundle-content[courseLevel]', [
			DASHBOARD,
			OVERVIEW,
			ASSESSMENT,
			FORUM,
			REPORTS,
			INFO
		], OVERVIEW).then((item) => {
			item.onDelete = () => this.gotoResources();
			item.gotoResources = () => this.gotoResources();

			return item.handleRoute(subRoute, route.precache);
		});
	},


	showVideos (route, subRoute) {
		const {id} = route.params;

		return this.setActiveView(OVERVIEW, [
			DASHBOARD,
			ASSESSMENT,
			FORUM,
			REPORTS,
			INFO
		]).then((item) => {
			return item.showCourseMedia(id);
		});
	},


	getPageInfoRoute: function (obj) {
		var id = obj.getId ? obj.getId() : obj.NTIID;

		id = encodeForURI(id);

		return {
			route: '/content/' + id,
			title: obj.get ? obj.get('label') : obj.label,
			precache: {
				pageInfo: obj.isModel ? obj : null
			}
		};
	},

	getRelatedWorkRoute: function (obj) {
		var id = obj.getId();

		id = encodeForURI(id);

		return {
			route: '/content/' + id,
			title: obj.get('label'),
			precache: {
				relatedWork: obj
			}
		};

	},

	getAssignmentRoute: function (obj) {
		var id = obj.getId ? obj.getId() : obj.NTIID,
			route;

		id = encodeForURI(id);

		route = '/assignments/' + id;

		return {
			route: route,
			title: obj.get ? obj.get('title') : obj.title,
			precache: {
				assignment: obj.isModel ? obj : null
			}
		};
	},

	getLessonRoute: function (obj) {
		var id = obj.getId ? obj.getId() : obj.NTIID,
			route;

		id = encodeForURI(id);

		route = '/lessons/' + id;

		return {
			route: route,
			title: obj.get ? obj.get('title') : obj.title,
			precache: {
				lesson: obj.isModel ? obj : null
			}
		};
	},


	getTopicRoute (obj) {
		if (!obj.get) {
			throw new Error('Can\'t resolve topic route for just an NTIID, need the full object');
		}

		const boardId = obj.get('BoardNTIID');
		let forumID = obj.get('ContainerId');
		let topicID = obj.getId();

		if (!forumID || !topicID) {
			return Promise.reject('No Forum Id for the Topic');
		}

		if (!this.activeBundle || !this.activeBundle.containsBoard(boardId)) {
			return Promise.reject('Board is not in the active course');
		}

		forumID = encodeForURI(forumID);
		topicID = encodeForURI(topicID);

		return {
			route: `/discussions/${forumID}/object/${topicID}`,
			title: obj.get('title'),
			precache: {
				topic: obj
			}
		};
	},


	getRouteForPath: function (path, course) {
		var root = path[0] || {},
			subPath = path.slice(1),
			page, i,
			route;

		for (i = 0; i < subPath.length; i++) {
			if (subPath[i] instanceof NextThought.model.PageInfo) {
				page = subPath[i];
				break;
			}
		}

		if (page && page.getAssignment()) {
			root = page.getAssignment();
		}

		if (root.isBoard) {
			root = subPath[0];
			subPath = subPath.slice(1);
		}

		if (this.isCourseMediaPath(path)) {
			route = this.getCourseMediaRoute(path);
		} else if (root.isForum) {
			route = this.getRouteForForum(root, subPath);
		} else if (root instanceof NextThought.model.assessment.Assignment) {
			route = this.getRouteForAssignment(root, subPath);
		} else if (root instanceof NextThought.model.courses.navigation.CourseOutlineContentNode) {
			route = this.getRouteForLesson(root, subPath);
		} else if (root instanceof NextThought.model.PageInfo) {
			route = this.getRouteForPageInfo(root, subPath);
		} else if (root instanceof NextThought.model.courseware.UsersCourseAssignmentHistoryItem) {
			route = this.getRouteForHistoryItem(root, subPath);
		} else {
			route = {
				path: '',
				isFull: path.length <= 0
			};
		}

		return route;
	},


	isCourseMediaPath (path) {
		let seenOutlineNode = false;
		let seenVideo = false;

		for (let part of path) {
			if (part instanceof NextThought.model.courses.navigation.CourseOutlineContentNode) {
				seenOutlineNode = true;
			} else if (part instanceof NextThought.model.Video) {
				seenVideo = true;
			}
		}

		return seenVideo && !seenOutlineNode;
	},


	getCourseMediaRoute (path) {
		let videoId;

		for (let part of path) {
			if (part instanceof NextThought.model.Video) {
				videoId = encodeForURI(part.getId());
			}
		}

		return {
			path: `videos/${videoId}`,
			isFull: true
		};
	},


	getRouteForAssignment: function (assignment, path) {
		var cmp = this.down(ASSESSMENT),
			route = cmp.getRouteForPath(path, assignment);

		route.path = '/assignments/' + Globals.trimRoute(route.path);

		return route;
	},

	getRouteForLesson: function (lesson, path) {
		var cmp = this.down(OVERVIEW),
			route = cmp.getRouteForPath(path, lesson);

		route.path = '/lessons/' + Globals.trimRoute(route.path);

		return route;
	},

	getRouteForHistoryItem: function (historyItem, path) {
		let	root = path[0],
			route;

		const AssignmentId = encodeForURI(root.get('AssignmentId'));
		const submissionCreator = User.getUsernameForURL(root.get('SubmissionCreator'));

		if (root instanceof NextThought.model.courseware.UsersCourseAssignmentHistoryItemFeedback) {
			route = `/assignments/${AssignmentId}/students/${submissionCreator}/#feedback`;

			return {
				path: route,
				isFull: true
			};
		}
	}
});
