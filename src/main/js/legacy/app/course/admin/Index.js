const Ext = require('@nti/extjs');
const { getService } = require('@nti/web-client');
const {AdminTools} = require('@nti/web-course');
const { encodeForURI } = require('@nti/lib-ntiids');

const NavigationActions = require('legacy/app/navigation/Actions');
const ComponentsNavigation = require('legacy/common/components/Navigation');

require('legacy/common/components/Navigation');
require('legacy/overrides/ReactHarness');
require('legacy/login/StateStore');


// const DASHBOARD_ACTIVE = /^\/dashboard/;
const REPORTS_ACTIVE = /^\/reports/;
const ROSTER_ACTIVE = /^\/roster/;
const ADVANCED_ACTIVE = /^\/advanced/;
const ROSTER_ID = 'course.admin.roster';
const ADMIN_TOOLS_ID = 'course.admin.tools';

const maybeHide = x => x && x.hide();

module.exports = exports = Ext.define('NextThought.app.course.admin.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-admin-index',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'course-admin-index',

	layout: 'none',
	items: [],

	onRouteActivate () {
		clearTimeout(this.cleanupTimeout);
		this.setTitle('Course Administration');

		if(this.siteAdminTools) {
			this.siteAdminTools.el.mask('Loading...');
		}
	},

	onRouteDeactivate () {
		this.cleanupTimeout = setTimeout(() => {
			this.remove(this.siteAdminTools, true);
			this.remove(this.siteAdminRoster, true);

			delete this.siteAdminTools;
			delete this.siteAdminRoster;
		}, 500);
	},


	initComponent: function () {
		this.callParent(arguments);

		this.initRouter();
		this.addDefaultRoute(this.showSiteAdmin.bind(this));

		this.NavigationActions = NavigationActions.create();
	},


	setCourseId (courseId) {
		this.courseId = courseId;
	},

	showSiteAdmin (route) {
		const baseroute = this.getBaseRoute();
		if (this.siteAdminTools && !ROSTER_ACTIVE.test(route.path)) {
			maybeHide(this.siteAdminRoster);

			this.siteAdminTools.show();
			this.siteAdminTools.setBaseRoute(baseroute);
		} else if (this.siteAdminRoster && ROSTER_ACTIVE.test(route.path)) {
			maybeHide(this.siteAdminTools);

			this.siteAdminRoster.show();
		} else if (!this.siteAdminTools && !ROSTER_ACTIVE.test(route.path)) {
			maybeHide(this.siteAdminRoster);

			this.setupAdminTools();
		} else if (!this.siteAdminRoster && ROSTER_ACTIVE.test(route.path)) {
			maybeHide(this.siteAdminTools);

			this.setupRoster();
		}

		this.setUpNavigation(baseroute, route.path);
	},


	setupAdminTools () {
		const baseroute = this.getBaseRoute();

		this.siteAdminTools = this.add({
			xtype: 'react',
			itemId: ADMIN_TOOLS_ID,
			component: AdminTools.View,
			baseroute: baseroute,
			onChange: async () => {
				if(this.activeBundle) {
					await this.activeBundle.updateFromServer();

					this.setBundle(this.activeBundle);
				}
			},
			loading: true,
			setTitle: (title) => { this.setTitle(title); }
		});

	},


	setupRoster () {
		this.siteAdminRoster = this.add({
			xtype: 'course-info-roster',
			itemId: ROSTER_ID
		});


	},

	async setBundle (activeBundle) {
		this.activeBundle = activeBundle;
		const service = await getService();
		const course = await service.getObject(activeBundle.rawData.NTIID);

		if (this.siteAdminRoster && this.siteAdminRoster.isVisible()) {
			this.siteAdminRoster.setContent(activeBundle);
			this.siteAdminRoster.onRouteActivate();
		} else if (this.siteAdminTools && this.siteAdminTools.isVisible()) {
			this.siteAdminTools.setProps({ course, loading: false });
		}

		if(this.siteAdminTools) {
			this.siteAdminTools.el.unmask();
		}
	},

	setUpNavigation (baseroute, path) {
		const navigation = this.getNavigation();
		const me = this;
		const onBack = () => {
			me.pushRootRoute('', `/course/${encodeForURI(me.activeBundle.getId())}/info`);
		};

		const showRoster = this.activeBundle && this.activeBundle.hasLink('CourseEnrollmentRoster');
		const showReports = this.activeBundle && this.activeBundle.getReportLinks().length > 0 ? true : false;

		// we should only be showing this page if the user has an administrative enrollment, might as well always show advanced (individual items on the advanced tab will be
		// disabled/enabled according to the user's permissions)
		const showAdvanced = true;//this.activeBundle && (this.activeBundle.hasLink('lti-configured-tools') || this.activeBundle.hasLink('CompletionPolicy'));

		navigation.updateTitle('Course Administration');

		const tabs = [];

		// {
		// 	text: 'Dashboard',
		// 	route: '/dashboard',
		// 	active: DASHBOARD_ACTIVE.test(path) || path === '/'
		// },

		if (showReports) {
			tabs.push({
				text: 'Reports',
				route: '/reports',
				active: REPORTS_ACTIVE.test(path)
			});
		}

		if (showRoster) {
			tabs.push({
				text: 'Roster',
				route: '/roster',
				active: ROSTER_ACTIVE.test(path)
			});
		}

		if (showAdvanced) {
			tabs.push({
				text: 'Advanced',
				route: '/advanced',
				active: ADVANCED_ACTIVE.test(path)
			});
		}

		navigation.setTabs(tabs);

		this.NavigationActions.setActiveContent(this.activeBundle, true, false);
		this.NavigationActions.updateNavBar({
			cmp: navigation,
			noLibraryLink: false,
			hideBranding: true,
			onBack
		});
	},


	getNavigation: function () {
		if (!this.navigation || this.navigation.isDestroyed) {
			this.navigation = ComponentsNavigation.create({
				bodyView: this
			});
		}

		return this.navigation;
	},

	onTabChange: function (title, route, subroute, tab) {
		this.pushRoute(title, route, subroute);
	}
});
