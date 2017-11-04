const Ext = require('extjs');

const NavigationActions = require('legacy/app/navigation/Actions');
const ComponentsNavigation = require('legacy/common/components/Navigation');

require('legacy/common/components/Navigation');
require('legacy/overrides/ReactHarness');
require('legacy/login/StateStore');
require('./course');
require('./users');
require('./advanced');
require('./dashboard');
require('./reports');

module.exports = exports = Ext.define('NextThought.app.siteadmin.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.site-admin-index',
	cls: 'site-admin-index',
	layout: 'card',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/course', this.setAdminCourseActive.bind(this));
		this.addRoute('/users', this.setAdminUsersActive.bind(this));
		this.addRoute('/advanced', this.setAdminAdvancedActive.bind(this));
		this.addRoute('/dashboard', this.setAdminDashboardActive.bind(this));
		this.addRoute('/reports', this.setAdminReportsActive.bind(this));
		this.addDefaultRoute('/course');

		this.NavigationActions = NavigationActions.create();
	},

	setActiveView: function (xtype, selector) {
		var old = this.getLayout().getActiveItem(),
			cmp = this.down(selector || xtype);

		if (!cmp) {
			cmp = this.add(Ext.widget(xtype));

			this.addChildRouter(cmp);
		}

		this.activeCmp = xtype;

		this.setTitle('Admin');

		this.getLayout().setActiveItem(cmp);

		this.NavigationActions.updateNavBar({
			cmp: this.getNavigation(),
			noLibraryLink: false,
			hideBranding: true,
			onBack: () => {
				this.pushRootRoute('Library', '/library');
			}});
		this.NavigationActions.setActiveContent(null, true, true);
		this.getNavigation().updateTitle('Admin');

		//If this is the first element added, the card layout
		//wont' fire the activate event so trigger it ourselves.
		if (!old) {
			cmp.fireEvent('activate');
		}

		let tabs = [
			{
				text: 'Course',
				route: '/course',
				active: this.activeCmp === 'site-admin-course'
			},
			{
				text: 'Users',
				route: '/users',
				active: this.activeCmp === 'site-admin-users'
			},
			{
				text: 'Dashboard',
				route: '/dashboard',
				active: this.activeCmp === 'site-admin-dashboard'
			},
			{
				text: 'Reports',
				route: '/reports',
				active: this.activeCmp === 'site-admin-reports'
			},
			{
				text: 'Advanced',
				route: '/advanced',
				active: this.activeCmp === 'site-admin-advanced'
			}
		];

		this.getNavigation().setTabs(tabs);

		return cmp;
	},

	setAdminCourseActive: function (route, subRoute) {
		var cmp = this.setActiveView('site-admin-course');

		return cmp.handleRoute(subRoute, route.precache);
	},

	setAdminUsersActive: function (route, subRoute) {
		var cmp = this.setActiveView('site-admin-users');

		return cmp.handleRoute(subRoute, route.precache);
	},

	setAdminAdvancedActive: function (route, subRoute) {
		var cmp = this.setActiveView('site-admin-advanced');

		return cmp.handleRoute(subRoute, route.precache);
	},

	setAdminDashboardActive: function (route, subRoute) {
		var cmp = this.setActiveView('site-admin-dashboard');

		return cmp.handleRoute(subRoute, route.precache);
	},

	setAdminReportsActive: function (route, subRoute) {
		var cmp = this.setActiveView('site-admin-reports');

		return cmp.handleRoute(subRoute, route.precache);
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
