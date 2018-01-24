const Ext = require('extjs');
const { getService } = require('nti-web-client');

const NavigationActions = require('legacy/app/navigation/Actions');
const ComponentsNavigation = require('legacy/common/components/Navigation');
const {AdminTools} = require('nti-web-course');

require('legacy/common/components/Navigation');
require('legacy/overrides/ReactHarness');
require('legacy/login/StateStore');


const DASHBOARD_ACTIVE = /^\/dashboard/;
const REPORTS_ACTIVE = /^\/reports/;

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

		if (this.siteAdmin) {
			this.siteAdmin.setBaseRoute(baseroute);
		} else {
			this.siteAdmin = this.add({
				xtype: 'react',
				component: AdminTools.View,
				baseroute: baseroute,
				loading: true,
				setTitle: (title) => {this.setTitle(title); }
			});
		}

		this.setUpNavigation(baseroute, route.path);
	},

	async setBundle (activeBundle) {
		this.activeBundle = activeBundle;
		const service = await getService();
		const course = await service.getObject(activeBundle.rawData);
		
		if (this.siteAdmin) {
			this.siteAdmin.setProps({ course, loading: false });
		}
	},

	setActiveBundle (activeBundle) {
		
	},

	setUpNavigation (baseroute, path) {
		const navigation = this.getNavigation();


		navigation.updateTitle('Course Administration');

		const tabs = [
			{
				text: 'Dashboard',
				route: '/dashboard',
				active: DASHBOARD_ACTIVE.test(path)
			},
			{
				text: 'Reports',
				route: '/reports',
				active: REPORTS_ACTIVE.test(path)
			}
		];

		navigation.setTabs(tabs);

		this.NavigationActions.setActiveContent(this.activeBundle, true, false);
		this.NavigationActions.updateNavBar({
			cmp: navigation,
			noLibraryLink: false,
			hideBranding: true,
			onBack: () => {
				this.pushRootRoute('Library', '/library');
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
