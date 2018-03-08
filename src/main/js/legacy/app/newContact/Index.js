const Ext = require('extjs');
const CatalogView = require('nti-web-contacts');

const Globals = require('legacy/util/Globals');
const NavigationActions = require('legacy/app/navigation/Actions');
const ComponentsNavigation = require('legacy/common/components/Navigation');

require('legacy/common/components/Navigation');
require('legacy/overrides/ReactHarness');
require('legacy/login/StateStore');

const GROUPS_ACTIVE = /^\/groups/;
const LISTS_ACTIVE = /^\/list/;

function getPathname (a) {
	const pathname = a.pathname;

	if (pathname.charAt(0) !== '/') {
		const href = a.toString();
		const parts = Globals.getURLParts(href);

		return parts.pathname;
	}

	return pathname;
}

module.exports = exports = Ext.define('NextThought.app.newContacts.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.contact-component',
	id: 'contact-component',

	mixins: {
		Route: 'NextThought.mixins.Router'
	},

	layout: 'none',
	initComponent: function () {
		var me = this;

		me.callParent(arguments);
		this.initRouter();

		this.addDefaultRoute(this.showPeople.bind(this));

		this.NavigationActions = NavigationActions.create();
	},

	afterRender () {
		this.callParent(arguments);

		this.mon(this.el, 'click', this.onClick.bind(this));
	},


	onClick (e) {
		const a = e.getTarget('a[href]');
		const path = a && getPathname(a);
		const route = path && path.replace(/^\/?app\/?/, '');

		if (route) {
			this.pushRootRoute('', route, {});
			e.stopEvent();
		}
	},

	showPeople (route) {
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

		const title = this.getTitleFromRoute(route.path);
		this.setTitle(title);

		this.setUpNavigation(baseroute, route.path);
	},

	getTitleFromRoute (route) {
		console.log(route);
		if (route === '/') {
			return 'Contacts';
		}
		else if (route === '/groups') {
			return 'Groups';
		}
		else if (route === '/list') {
			return 'Sharing List';
		}
		return 'NextThought';
	},

	setUpNavigation (baseroute, path) {
		const navigation = this.getNavigation();


		navigation.updateTitle('Contact');

		const tabs = [
			{
				text: 'People',
				route: '/',
				active: path.length === 1
			},
			{
				text: 'Groups',
				route: '/groups',
				active: GROUPS_ACTIVE.test(path) && path.length !== 1
			},
			{
				text: 'Sharing List',
				route: '/list',
				active: LISTS_ACTIVE.test(path) && path.length !== 1
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
