const Ext = require('extjs');
const { getService } = require('nti-web-client');
const {AdminTools} = require('nti-web-course');

const NavigationActions = require('legacy/app/navigation/Actions');
const ComponentsNavigation = require('legacy/common/components/Navigation');

require('legacy/common/components/Navigation');
require('legacy/overrides/ReactHarness');
require('legacy/login/StateStore');


const DASHBOARD_ACTIVE = /^\/dashboard/;
const REPORTS_ACTIVE = /^\/reports/;
const ROSTER_ACTIVE = /^\/roster/;
const ROSTER_ID = 'course.admin.roster';
const ADMIN_TOOLS_ID = 'course.admin.tools';

module.exports = exports = Ext.define('NextThought.app.course.admin.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-admin-index',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'course-admin-index',

	layout: 'none',
	items: [],


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
			this.siteAdminRoster.hide();
			this.siteAdminTools.show();
			this.siteAdminTools.setBaseRoute(baseroute);	
		} else if (this.siteAdminRoster && ROSTER_ACTIVE.test(route.path)) {
			this.siteAdminTools.hide();
			this.siteAdminRoster.show();
		} else if (!this.siteAdminTools && !ROSTER_ACTIVE.test(route.path)) {
			if(this.siteAdminRoster) {
				this.siteAdminRoster.hide();
			}
			this.setupAdminTools();
		} else if (!this.siteAdminRoster && ROSTER_ACTIVE.test(route.path)) {
			if(this.siteAdminTools) {
				this.siteAdminTools.hide();
			}
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
		const course = await service.getObject(activeBundle.rawData);

		if (this.siteAdminRoster && this.siteAdminRoster.isVisible()) {
			this.siteAdminRoster.setContent(activeBundle);
		} else if (this.siteAdminTools && this.siteAdminTools.isVisible()) {
			this.siteAdminTools.setProps({ course, loading: false });
		}
	},

	setUpNavigation (baseroute, path) {
		const navigation = this.getNavigation();


		navigation.updateTitle('Course Administration');

		const tabs = [
			{
				text: 'Dashboard',
				route: '/dashboard',
				active: DASHBOARD_ACTIVE.test(path) || path === '/'
			},
			{
				text: 'Reports',
				route: '/reports',
				active: REPORTS_ACTIVE.test(path)
			},
			{
				text: 'Roster',
				route: '/roster',
				active: ROSTER_ACTIVE.test(path)
			}
		];

		navigation.setTabs(tabs);

		this.NavigationActions.setActiveContent(this.activeBundle, true, false);
		this.NavigationActions.updateNavBar({
			cmp: navigation,
			noLibraryLink: false,
			hideBranding: true,
			onBack: () => {
				this.pushRootRoute(baseroute, '/');
			}
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
