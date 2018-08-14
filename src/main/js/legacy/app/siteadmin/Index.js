const Ext = require('@nti/extjs');

const NavigationActions = require('legacy/app/navigation/Actions');
const ComponentsNavigation = require('legacy/common/components/Navigation');
const {View:SiteAdminView} = require('nti-web-site-admin');

require('legacy/common/components/Navigation');
require('legacy/overrides/ReactHarness');
require('legacy/login/StateStore');

const CONTENT_ACTIVE = /^\/content/;
const USERS_ACTIVE = /^\/users/;
const DASHBOARD_ACTIVE = /^\/dashboard/;
const REPORTS_ACTIVE = /^\/reports/;
const ADVANCED_ACTIVE = /^\/advanced/;

module.exports = exports = Ext.define('NextThought.app.siteadmin.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.site-admin-index',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'site-admin-index',

	layout: 'none',
	items: [],


	initComponent: function () {
		this.callParent(arguments);

		this.initRouter();

		this.addDefaultRoute(this.showSiteAdmin.bind(this));

		// this.addRoute('/course', this.setAdminCourseActive.bind(this));
		// this.addRoute('/users', this.setAdminUsersActive.bind(this));
		// this.addRoute('/advanced', this.setAdminAdvancedActive.bind(this));
		// this.addRoute('/dashboard', this.setAdminDashboardActive.bind(this));
		// this.addRoute('/reports', this.setAdminReportsActive.bind(this));
		// this.addDefaultRoute('/course');

		this.NavigationActions = NavigationActions.create();
	},


	showSiteAdmin (route) {
		const baseroute = this.getBaseRoute();

		if (this.siteAdmin) {
			this.siteAdmin.setBaseRoute(baseroute);
		} else {
			this.siteAdmin = this.add({
				xtype: 'react',
				component: SiteAdminView,
				baseroute: baseroute,
				setTitle: (title) => {this.setTitle(title); }
			});
		}

		this.setUpNavigation(baseroute, route.path);
	},


	setUpNavigation (baseroute, path) {
		const navigation = this.getNavigation();


		navigation.updateTitle('Site Administration');

		const tabs = [
			{
				text: 'Dashboard',
				route: '/dashboard',
				active: DASHBOARD_ACTIVE.test(path)
			},
			{
				text: 'People',
				route: '/people',
				active: USERS_ACTIVE.test(path)
			},
			{
				text: 'Content',
				route: '/content',
				active: CONTENT_ACTIVE.test(path)
			},
			{
				text: 'Reports',
				route: '/reports',
				active: REPORTS_ACTIVE.test(path)
			}
		];

		// as of now, the only thing that exists on the advanced tab is the
		// credit definitions maangement tool.  Without that link, no need to show
		// the advanced tab at all
		if(Service.getCollection('CreditDefinitions', 'Global')) {
			tabs.push({
				text: 'Advanced',
				route: '/advanced',
				active: ADVANCED_ACTIVE.test(path)
			});
		}

		navigation.setTabs(tabs);

		this.NavigationActions.setActiveContent(null, true, true);
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
