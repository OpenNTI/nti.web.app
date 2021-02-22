const Ext = require('@nti/extjs');

const NavigationActions = require('legacy/app/navigation/Actions');
const ComponentsNavigation = require('legacy/common/components/Navigation');
const { View: SiteAdminView } = require('nti-web-site-admin');

require('legacy/common/components/Navigation');
require('legacy/overrides/ReactHarness');
require('legacy/login/StateStore');

module.exports = exports = Ext.define('NextThought.app.siteadmin.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.site-admin-index',

	mixins: {
		Router: 'NextThought.mixins.Router',
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

	onRouteDeactivate() {
		this.deactivateTimeout = setTimeout(() => {
			if (this.siteAdmin) {
				this.siteAdmin.destroy();
				delete this.siteAdmin;
			}
		}, 100);
	},

	onRouteActivate() {
		clearTimeout(this.deactivateTimeout);
	},

	showSiteAdmin(route) {
		const baseroute = this.getBaseRoute();

		if (this.siteAdmin) {
			this.siteAdmin.setBaseRoute(baseroute);
		} else {
			this.siteAdmin = this.add({
				xtype: 'react',
				component: SiteAdminView,
				baseroute: baseroute,
				workspace: Service.getWorkspace('SiteAdmin'),
				getRouteFor: (obj, context) => {
					if (
						!obj ||
						obj.Class !== 'Workspace' ||
						obj.Title !== 'SiteAdmin'
					) {
						return;
					}

					const base = '/app/siteadmin/';
					let part = '';

					if (context === 'dashboard') {
						part = 'dashboard';
					} else if (context === 'people') {
						part = 'people';
					} else if (context === 'content') {
						part = 'content';
					} else if (context === 'reports') {
						part = 'reports';
					} else if (context === 'configuration') {
						part = 'configuration';
					}

					return part ? `${base}${part}/` : base;
				},
				setTitle: title => {
					this.setTitle(title);
				},
			});
		}

		this.setUpNavigation(baseroute, route.path);
	},

	setUpNavigation(baseroute, path) {
		const navigation = this.getNavigation();

		navigation.updateTitle('Site Administration');
		navigation.useCommonTabs();

		this.NavigationActions.setActiveContent(null, true, true);
		this.NavigationActions.updateNavBar({
			cmp: navigation,
			noLibraryLink: false,
			hideBranding: true,
			onBack: () => {
				this.pushRootRoute('Library', '/library');
			},
		});
	},

	getNavigation: function () {
		if (!this.navigation || this.navigation.isDestroyed) {
			this.navigation = ComponentsNavigation.create({
				bodyView: this,
			});
		}

		return this.navigation;
	},

	onTabChange: function (title, route, subroute, tab) {
		this.pushRoute(title, route, subroute);
	},
});
