const Ext = require('extjs');

const NavigationActions = require('legacy/app/navigation/Actions');
const ComponentsNavigation = require('legacy/common/components/Navigation');
const CatalogView = require('nti-web-catalog');

require('legacy/common/components/Navigation');
require('legacy/overrides/ReactHarness');
require('legacy/login/StateStore');

const PURCHASED_ACTIVE = /^\/purchased/;
const REDEEM_ACTIVE = /^\/redeem/;

module.exports = exports = Ext.define('NextThought.app.catalog.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.catalog-component',
	id: 'catalog-component',

	mixins: {
		Route: 'NextThought.mixins.Router'
	},

	layout: 'none',
	initComponent: function () {
		this.callParent(arguments);

		this.removeCls('make-white');
		this.addCls('course-catalog-body');

		this.initRouter();

		this.addDefaultRoute(this.showCatalog.bind(this));

		this.NavigationActions = NavigationActions.create();
	},

	afterRender () {
		this.callParent(arguments);

		this.mon(this.el, 'click', this.onClick.bind(this));
	},


	onClick (e) {
		const a = e.getTarget('a[href]');
		const path = a && a.pathname;
		const route = path && path.replace(/^\/?app\/?/, '');

		if (route) {
			this.pushRootRoute({}, route, '');
			e.stopEvent();
		}
	},

	showCatalog (route) {
		const baseroute = this.getBaseRoute();

		if (this.catalog) {
			this.catalog.setBaseRoute(baseroute);
		} else {
			this.catalog = this.add({
				xtype: 'react',
				component: CatalogView,
				baseroute: baseroute
			});
		}
		this.setTitle(this.getTitle(route.path));

		this.setUpNavigation(baseroute, route.path);
	},

	getTitle (title) {
		if (title === '/') {
			return 'Catalog';
		}
		else if (title === '/.nti_other') {
			return 'Others';
		}
		const result = title.substr(1);
		return result[0].toUpperCase() + result.substr(1);
	},

	setUpNavigation (baseroute, path) {
		const navigation = this.getNavigation();


		navigation.updateTitle('Catalog');


		const tabs = [
			{
				text: 'Courses',
				route: '/',
				active: path.length === 1
			},
			{
				text: 'Purchased',
				route: '/purchased',
				active: PURCHASED_ACTIVE.test(path) && path.length !== 1
			},
			{
				text: 'Redeem',
				route: '/redeem',
				active: REDEEM_ACTIVE.test(path) && path.length !== 1
			}

		];

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

