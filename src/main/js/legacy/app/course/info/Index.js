const Ext = require('extjs');
const {wait} = require('@nti/lib-commons');

const WindowsActions = require('../../windows/Actions');
const CoursesStateStore = require('../../library/courses/StateStore');

require('legacy/common/components/NavPanel');
require('legacy/mixins/Router');
require('../../library/courses/components/available/CourseDetailWindow');
require('./components/Body');
require('./components/Outline');


module.exports = exports = Ext.define('NextThought.app.course.info.Index', {
	extend: 'NextThought.common.components.NavPanel',
	alias: 'widget.course-info',
	title: '',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	navigation: {xtype: 'course-info-outline'},
	body: {xtype: 'course-info-body'},

	initComponent: function () {
		this.callParent(arguments);

		var me = this;
		me.initRouter();
		me.addRoute('/', this.showInfo.bind(me));
		me.addRoute('/instructors', me.showInstructors.bind(me));
		me.addRoute('/support', me.showSupport.bind(me));
		me.addRoute('/admintools', me.showAdminTools.bind(me));
		me.on('activate', this.onActivate.bind(me));

		me.WindowActions = WindowsActions.create();
		me.CourseStore = CoursesStateStore.getInstance();
		me.mon(me.navigation,
			{
				'select-route': me.changeRoute.bind(me),
				'show-enrollment': me.showEnrollment.bind(me)
			}
		);

		me.body.onSave = (catalogEntry) => {
			me.navigation.updateCatalogEntry && me.navigation.updateCatalogEntry(catalogEntry);
		};

		me.on('show-enrollment', me.showEnrollment.bind(me));
	},

	onActivate: function () {
		if (!this.rendered) { return; }

		this.setTitle(this.title);
		this.alignNavigation();
	},

	onRouteDeactivate: function () {
		this.body && this.body.onRouteDeactivate && this.body.onRouteDeactivate();

		this.routeDeactivated = true;
	},

	bundleChanged: function (bundle) {
		var me = this,
			catalogEntry = bundle && bundle.getCourseCatalogEntry && bundle.getCourseCatalogEntry();

		function update (info, status, showRoster, showReports) {
			let showInviteCode = me.bundle.hasLink('SendCourseInvitations'),
				inviteCodeLink = showInviteCode && me.bundle.getLink('CourseAccessTokens');

			me.hasInfo = !!info;

			me[me.infoOnly ? 'addCls' : 'removeCls']('info-only');

			if(me.routeDeactivated || me.currId !== bundle.getId()) {
				me.routeDeactivated = false;
				me.body.setContent(info, status, showRoster, bundle, showReports);
				me.navigation.setContent(info, status, showRoster, me.infoOnly, inviteCodeLink, showReports);
			}

			me.currId = bundle.getId();
		}


		me.hasInfo = !!catalogEntry;
		me.infoOnly = catalogEntry && catalogEntry.get('Preview') === true;
		me.bundle = bundle;

		if (bundle && bundle.getWrapper) {
			return bundle.getWrapper()
				.then(function (e) {
					var showRoster = bundle.hasLink('CourseEnrollmentRoster');
					const showReports = bundle.getReportLinks().length > 0 ? true : false;
					update(catalogEntry, e.get('Status'), showRoster, showReports);
				})
				.catch(function () {
					//hide tab?
				});
		}

		return Promise.resolve();
	},

	showInfo: function (route, subRoute) {
		var me = this;

		me.navigation.setActiveItem(route);
		me.body.setActiveItem('info').then(function () {
			me.body.scrollInfoSectionIntoView(route);
			me.alignNavigation();
		});
	},

	showInstructors: function (route, subRoute) {
		var me = this;

		me.navigation.setActiveItem(route);
		me.body.setActiveItem('info').then(function () {
			me.body.scrollInfoSectionIntoView(route);
			me.alignNavigation();
		});
	},

	showSupport: function (route, subRoute) {
		var me = this;

		me.navigation.setActiveItem(route);
		me.body.setActiveItem('info').then(function () {
			me.body.scrollInfoSectionIntoView(route);
			me.alignNavigation();
		});
	},

	showAdminTools: function (route, subRoute) {
		var me = this;

		me.navigation.setActiveItem(route);
		me.navigation.setActiveItem(route);
		me.body.setActiveItem('info').then(function () {
			me.body.scrollInfoSectionIntoView(route);
			me.alignNavigation();
		});
	},

	changeRoute: function (title, route) {
		this.pushRoute(title, route || '/');
	},

	showEnrollment: function (catalogEntry) {
		this.WindowActions.pushWindow(catalogEntry, null, null, {afterClose: this.onWindowClose.bind(this, catalogEntry)});
	},

	onWindowClose: function (catalogEntry) {
		var isEnrolled = catalogEntry && catalogEntry.get('IsEnrolled');

		if (!isEnrolled) {
			wait()
				.then(this.pushRootRoute.bind(this, 'Library', '/library'));
		}
	}
});
