const Ext = require('@nti/extjs');
const Contacts = require('@nti/web-contacts');
const NavigationActions = require('internal/legacy/app/navigation/Actions');
const ComponentsNavigation = require('internal/legacy/common/components/Navigation');
require('internal/legacy/overrides/ReactHarness');
require('internal/legacy/mixins/Router');

require('./components/TabView');
require('./components/ContactTabView');
require('./components/GroupTabView');
require('./components/ListView');

const CONTACTS_ACTIVE = /^\/$/;
const GROUPS_ACTIVE = /^\/groups/;
const SHARING_LISTS_ACTIVE = /^\/sharing-lists/;

const CONTACTS_ROUTE = /^\/contacts/;

module.exports = exports = Ext.define('NextThought.app.contacts.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.contacts-index',
	id: 'contacts-index',
	title: 'Contacts',
	mixins: {
		Route: 'NextThought.mixins.Router',
	},
	items: [],
	layout: 'none',

	initComponent: function () {
		this.callParent(arguments);
		this.removeCls('make-white');
		this.initRouter();
		this.addDefaultRoute(this.showContacts.bind(this));
		this.NavigationActions = NavigationActions.create();
	},

	onRouteDeactivate(newRoute) {
		if (!CONTACTS_ROUTE.test(newRoute) && this.contacts) {
			this.contacts.destroy?.();
			delete this.contacts;
		}
	},

	showContacts(route) {
		const baseroute = this.getBaseRoute();

		if (this.contacts) {
			this.contacts.setBaseRoute(baseroute);
		} else {
			this.contacts = this.add({
				xtype: 'react',
				component: Contacts,
				baseroute: baseroute,
				setTitle: title => {
					this.setTitle(title);
				},
			});
		}

		this.setUpNavigation(baseroute, route.path);
	},

	setUpNavigation(baseroute, path) {
		const navigation = this.getNavigation();

		navigation.updateTitle('Contacts');

		const tabs = [
			{
				text: 'People',
				route: '/',
				active: CONTACTS_ACTIVE.test(path),
			},
			{
				text: 'Groups',
				route: '/groups',
				active: GROUPS_ACTIVE.test(path),
			},
			{
				text: 'Sharing Lists',
				route: '/sharing-lists',
				active: SHARING_LISTS_ACTIVE.test(path),
			},
		];

		navigation.setTabs(tabs);

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
