const Ext = require('extjs');
const catalog = require('nti-web-catalog');
const {getService} = require('nti-web-client');

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
		this.addCls('course-catalog-body');

		this.initRouter();

		this.addRoute('/', this.showCatalog.bind(this));

		this.add({
			xtype: 'react',
			component: catalog
		});
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

	applyState: function (state) {
		var active = state.active,
			tabs = [];

		let me = this;

		getService ().then ((service) => {
			const collection = service.getWorkspace ('Catalog').Items;
			for (let i = 0; i < collection.length; i++) {
				let item = {
					text: collection[i].Title,
					route: '/',
					subRoute: me.catalogRoute,
					active: active === collection[i].Title
				};
				tabs.push (item);
			}
			me.navigation.setTabs (tabs);
		});
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
			'Courses'
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