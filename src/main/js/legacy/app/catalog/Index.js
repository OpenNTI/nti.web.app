const Ext = require('extjs');
const catalog = require('nti-web-catalog');

const ComponentsNavigation = require('legacy/common/components/Navigation');
const NavigationActions = require('legacy/app/navigation/Actions');

module.exports = exports = Ext.define('NextThought.app.catalog.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.catalog-component',
	id: 'catalog-component',

	mixins: {
		Route: 'NextThought.mixins.Router'
	},

	layout: 'none',

	initComponent: function () {

		var me = this;
		this.NavigationActions = NavigationActions.create();

		me.callParent(arguments);
		this.removeCls('make-white');
		this.addCls('catalog-body');

		this.initRouter();

		this.addRoute('/', this.showCatalog.bind(this));

		this.add({
			xtype: 'react',
			component: catalog
		});
	},
	applyState: function (state) {
		var active = state.active,
			tabs = [];

		tabs.push({
			text: 'Catalog',
			route: '/',
			subRoute: this.catalogRoute,
			active: active === 'catalog'
		});

		tabs.push({
			text: 'Communities',
			route: '/communities',
			subRoute: this.groupsRoute,
			active: active === 'communities'
		});

		tabs.push({
			text: 'Books',
			route: '/books',
			subRoute: this.listsRoute,
			active: active === 'books'
		});
		tabs.push({
			text: 'Purchased',
			route: '/purchased',
			subRoute: this.listsRoute,
			active: active === 'purchased'
		});

		this.navigation.setTabs(tabs);
	},

	setActiveView: function (active, inactive, tab) {
		var me = this, item;

		me.prepareNavigation();
		me.applyState({
			active: tab || active
		});

		me.navigation.updateTitle('Catalog');

		return new Promise(function (fulfill, reject) {
			item = me.setActiveItem(active);
			fulfill(item);
		});
	},
	setActiveItem: function (xtype) {

	},
	showCatalog: function (route, subRoute) {
		this.catalogRoute = subRoute;

		this.setTitle('Catalog');
		this.setActiveView('catalog-tab-view',
			['groups-tab-view', 'lists-tab-view'],
			'catalog'
		).then(function (item) {
			if (item && item.handleRoute) {
				item.handleRoute(subRoute);
			}
		});
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
});
