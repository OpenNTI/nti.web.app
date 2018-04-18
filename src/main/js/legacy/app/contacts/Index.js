const Ext = require('extjs');
const {wait} = require('@nti/lib-commons');

const ComponentsNavigation = require('legacy/common/components/Navigation');
const NavigationActions = require('legacy/app/navigation/Actions');

const ContactsActions = require('./Actions');
const ContactsStateStore = require('./StateStore');

require('legacy/mixins/Router');
require('legacy/mixins/State');
require('./components/TabView');
require('./components/ContactTabView');
require('./components/GroupTabView');
require('./components/ListView');


module.exports = exports = Ext.define('NextThought.app.contacts.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.contacts-index',

	mixins: {
		Route: 'NextThought.mixins.Router',
		State: 'NextThought.mixins.State'
	},

	title: 'Contacts',
	defaultTab: 'my-contacts',
	id: 'contacts',

	items: [
		{ xtype: 'contacts-tab-view', id: 'my-contacts' },
		{ xtype: 'groups-tab-view', id: 'my-groups'},
		{ xtype: 'lists-tab-view', id: 'my-lists'}
	],

	layout: {
		type: 'card',
		deferredRender: true
	},

	defaultType: 'box',
	activeItem: 0,
	'componentMapping': {},

	initComponent: function () {
		var me = this;

		me.callParent(arguments);
		this.removeCls('make-white');

		this.ContactsActions = ContactsActions.create();
		this.ContactsStore = ContactsStateStore.getInstance();
		this.NavigationActions = NavigationActions.create();

		this.initRouter();

		this.addRoute('/', this.showContacts.bind(this));
		this.addRoute('/groups', this.showGroups.bind(this));
		this.addRoute('/lists', this.showLists.bind(this));

		this.addDefaultRoute('/');
	},

	afterRender: function () {
		this.callParent(arguments);
		if (Ext.is.iOS) {
			this.__adjustmentForiOS();
		}
	},

	applyState: function (state) {
		var active = state.active,
			tabs = [];

		tabs.push({
			text: 'Contacts',
			route: '/',
			subRoute: this.contactsRoute,
			active: active === 'contacts'
		});

		tabs.push({
			text: 'Groups',
			route: '/groups',
			subRoute: this.groupsRoute,
			active: active === 'groups'
		});

		tabs.push({
			text: 'Distribution Lists',
			route: '/lists',
			subRoute: this.listsRoute,
			active: active === 'lists'
		});

		this.navigation.setTabs(tabs);
	},

	showContacts: function (route, subRoute) {
		this.contactsRoute = subRoute;

		this.setTitle('Contacts');
		this.setActiveView('contacts-tab-view',
			['groups-tab-view', 'lists-tab-view'],
			'contacts'
		).then(function (item) {
			if (item && item.handleRoute) {
				item.handleRoute(subRoute);
			}
		});
	},

	showGroups: function (route, subRoute) {
		this.groupsRoute = subRoute;

		this.setTitle('Groups');
		this.setActiveView('groups-tab-view',
			['contacts-tab-view', 'lists-tab-view'],
			'groups'
		);
	},

	showLists: function (route, subRoute) {
		this.listsRoute = subRoute;

		this.setTitle('Distribution List');
		this.setActiveView('lists-tab-view',
			['groups-tab-view', 'contacts-tab-view'],
			'lists'
		);
	},

	setActiveView: function (active, inactive, tab) {
		var me = this, item;

		me.prepareNavigation();
		me.applyState({
			active: tab || active
		});

		me.navigation.updateTitle('Contacts');

		return new Promise(function (fulfill, reject) {
			item = me.setActiveItem(active);
			fulfill(item);
		});
	},

	setActiveItem: function (xtype) {
		var layout = this.getLayout(),
			item = this.getItem(xtype),
			current = layout.getActiveItem();

		if (current === item) {
			item.fireEvent('activate');
		}


		this.getLayout().setActiveItem(item);
		return item;
	},

	getItem: function (xtype) {
		var cmp = this.componentMapping[xtype];

		if (!cmp) {
			cmp = this.componentMapping[xtype] = this.down(xtype);
			if (cmp.handleRoute) {
				this.addChildRouter(cmp);
			}
			cmp.contactsContainer = this;
		}

		return cmp;
	},

	prepareNavigation: function () {
		this.NavigationActions.updateNavBar({
			cmp: this.getNavigation(),
			hideBranding: true
		});

		this.NavigationActions.setActiveContent(null);
	},

	getNavigation: function () {
		if (!this.navigation || this.navigation.isDestroyed) {
			this.navigation = ComponentsNavigation.create({
				bodyView: this
			});
		}

		return this.navigation;
	},

	onTabChange: function (title, route, tab) {
		this.pushRoute('', route);
	},

	restore: function (state) {
		return new Promise(function (fulfill) {
			this.setActiveTab(((state || {}).contacts || {}).activeTab);
			fulfill();
		}.bind(this));
	},

	__adjustmentForiOS: function () {
		var outline = this.el.down('.contact:nth-child(1)'),
			list = this.el.down('.contact:nth-child(2)'),
			input = this.el.down('input'),
			me = this;

		wait(100).then(function () {
			me.outlineY = outline.getY();
			me.outlineHeight = outline.getHeight();
		});

		//For keyboard, reduce height and adjust position of elements to fit within smaller screen
		input.on('focus', function () {
			wait(250).then(function () {
				if (window.innerHeight < 600) {
					outline.setHeight(window.innerHeight - 15);
					outline.setY(window.outerHeight - window.innerHeight);
					list.setY(window.outerHeight - window.innerHeight);
					list.setHeight(window.innerHeight - 15);
					me.keyboardUpScrollY = window.scrollY;
				}
			});
		});

		//Undo resizing and repositioning when keyboard dismissed
		input.on('blur', function () {
			if (this.outlineY) {
				outline.setY(me.outlineY);
				outline.setHeight(me.outlineHeight);
				list.setY(me.outlineY);
				list.setHeight(me.outlineHeight);
				me.keyboardUpScrollY = false;
			}
		}, this);

		//Keep from permanently scrolling content off viewable area
		window.onscroll = function () {
			if (!me.keyboardUpScrollY) {
				return;
			}
			if (window.scrollY !== me.keyboardUpScrollY) {
				window.scrollTo(0, me.keyboardUpScrollY);
			}
		};
	}
});
