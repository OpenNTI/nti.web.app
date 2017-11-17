const Ext = require('extjs');
const catalog = require('nti-web-catalog');
const {getService} = require('nti-web-client');

const ComponentsNavigation = require('legacy/common/components/Navigation');
const NavigationActions = require('legacy/app/navigation/Actions');
let me = this;

module.exports = exports = Ext.define('NextThought.app.catalog.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.catalog-component',
	id: 'catalog-component',

	mixins: {
		Route: 'NextThought.mixins.Router'
	},

	layout: 'none',

	initComponent: function () {
		me = this;
		this.NavigationActions = NavigationActions.create();

		me.callParent(arguments);
		this.removeCls('make-white');
		this.addCls('course-catalog-body');

		this.initRouter();

		this.addRoute('/', this.showCatalog.bind(this));
		this.addRoute('/Featured', this.showFeature.bind(this));
		this.addRoute('/Purchased', this.showPurchased.bind(this));
		this.addRoute('/Redeem', this.showRedeem.bind(this));

		this.catalog = this.add({
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
		const active = state.active;
		let tabs = [];

		getService().then((service) => {
			const collection = service.getWorkspace('Catalog').Items;
			for (let i = 0; i < collection.length; i++) {
				let item = {
					text: collection[i].Title,
					route: '',
					subRoute: me.catalogRoute,
					active: active === collection[i].Title
				};
				if (collection[i].Title !== 'Courses') {
					item.route = '/' + collection[i].Title;
				}
				tabs.push(item);
			}
			tabs.push({
				text: 'Redeem',
				route: '/Redeem',
				subRoute: me.catalogRoute,
				active: active === 'Redeem'
			});
			me.navigation.setTabs(tabs);
		});
	},

	setActiveView: function (active, inactive, tab) {
		let item;

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
	showCollection () {
		return getService ()
			.then ((service) => {
				const collection = 'collection';

				me.catalog.setProps ({collection});
			});
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

		getService().then((service) => {
			me.catalog.setProps({loading: true});
			const {href} = service.getCollection('Courses', 'Catalog');
			service.get(href).then((data) => {
				const collection = data;
				me.catalog.setProps({collection, redeem: false, loading: false});
			});

		});
	},
	showFeature: function (route, subRoute) {
		this.catalogRoute = subRoute;

		this.setTitle('Featured');
		this.setActiveView('catalog-tab-view',
			['groups-tab-view', 'lists-tab-view'],
			'Featured'
		).then(function (item) {
			if (item && item.handleRoute) {
				item.handleRoute(subRoute);
			}
		});
		getService().then((service) => {
			me.catalog.setProps({loading: true});
			const {href} = service.getCollection('Featured', 'Catalog');
			service.get(href).then((data) => {
				const collection = data;
				me.catalog.setProps({collection, redeem: false, loading: false});
			});

		});
	},
	showPurchased: function (route, subRoute) {
		this.catalogRoute = subRoute;

		this.setTitle('Purchased');
		this.setActiveView('catalog-tab-view',
			['groups-tab-view', 'lists-tab-view'],
			'Purchased'
		).then(function (item) {
			if (item && item.handleRoute) {
				item.handleRoute(subRoute);
			}
		});

		getService().then((service) => {
			me.catalog.setProps({loading: true});
			const {href} = service.getCollection('Purchased', 'Catalog');
			service.get(href).then((data) => {
				const collection = data;
				me.catalog.setProps({collection, redeem: false, loading: false});
			});

		});
	},
	showRedeem: function (route, subRoute) {
		this.catalogRoute = subRoute;

		this.setTitle('Redeem');
		this.setActiveView('catalog-tab-view',
			['groups-tab-view', 'lists-tab-view'],
			'Redeem'
		).then(function (item) {
			if (item && item.handleRoute) {
				item.handleRoute(subRoute);
			}
		});
		const collection = Service.getCollection('Invitations', 'Invitations');
		this.catalog.setProps({redeem: true, collection: null, redeemCollection: collection});
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
	onTabChange: function (title, route, subroute, tab) {
		this.pushRoute(title, route, subroute);
	}
});
