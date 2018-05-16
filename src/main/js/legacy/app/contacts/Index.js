const Ext = require('@nti/extjs');
const {wait} = require('@nti/lib-commons');
const Contacts = require('@nti/web-contacts');


require('legacy/overrides/ReactHarness');

const NavigationActions = require('legacy/app/navigation/Actions');
const ComponentsNavigation = require('legacy/common/components/Navigation');
// const NavigationActions = require('legacy/app/navigation/Actions');
//
// const ContactsActions = require('./Actions');
// const ContactsStateStore = require('./StateStore');

require('legacy/mixins/Router');
require('legacy/mixins/State');
require('./components/TabView');
require('./components/ContactTabView');
require('./components/GroupTabView');
require('./components/ListView');

const CONTACTS_ACTIVE = /^\/contacts/;
const GROUPS_ACTIVE = /^\/groups/;
const SHARING_LISTS_ACTIVE = /^\/sharing-lists/;


module.exports = exports = Ext.define('NextThought.app.contacts.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.contacts-index',
	id: 'contacts-index',
	title: 'Contacts',
	mixins: {
		Route: 'NextThought.mixins.Router'
	},
	items: [],
	layout: 'none',

	initComponent: function () {
		this.callParent(arguments);
		this.initRouter();
		this.removeCls('make-white');
		this.addDefaultRoute(this.showContacts.bind(this));
		this.NavigationActions = NavigationActions.create();
	},

	showContacts (route) {
		const baseroute = this.getBaseRoute();

		if (this.contacts) {
			this.contacts.setBaseRoute(baseroute);
		} else {
			this.contacts = this.add({
				xtype: 'react',
				component: Contacts,
				baseroute: baseroute,
				setTitle: (title) => {this.setTitle(title);}
			});
		}

		this.setUpNavigation(baseroute, route.path);
	},

	setUpNavigation (baseroute, path) {
		const navigation = this.getNavigation();

		navigation.updateTitle('Contacts');

		const tabs = [
			{
				text: 'People',
				route: '/contacts',
				active: CONTACTS_ACTIVE.test(path)
			},
			{
				text: 'Groups',
				route: '/groups',
				active: GROUPS_ACTIVE.test(path)
			},
			{
				text: 'Sharing Lists',
				route: '/sharing-lists',
				active: SHARING_LISTS_ACTIVE.test(path)
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
