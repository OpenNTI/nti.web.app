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
		this.NavigationActions = NavigationActions.create ();

		me.callParent (arguments);
		this.removeCls ('make-white');
		this.addCls ('course-catalog-body');

		this.initRouter ();

		this.addRoute ('/:collection', this.showCollection.bind (this));
		this.addRoute ('/', this.showCatalog.bind (this));
		this.addRoute ('/Featured', this.showFeature.bind (this));
		this.addRoute ('/Purchased', this.showPurchased.bind (this));

		this.catalog = this.add ({
			xtype: 'react',
			component: catalog
		});
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
					route: '',
					subRoute: me.catalogRoute,
					active: active === collection[i].Title
				};
				if (collection[i].Title !== 'Courses') {
					item.route = '/' + collection[i].Title;
				}
				tabs.push (item);
			}
			me.navigation.setTabs (tabs);
		});
	},

	setActiveView: function (active, inactive, tab) {
		var me = this, item;

		me.prepareNavigation ();
		me.applyState ({
			active: tab || active
		});

		me.navigation.updateTitle ('Catalog');

		return new Promise (function (fulfill, reject) {
			item = me.setActiveItem (active);
			fulfill (item);
		});
	},
	setActiveItem: function (xtype) {

	},
	showCollection () {
		var me = this;
		return getService ()
			.then ((service) => {
				const collection = 'collection';

				me.catalog.setProps ({collection});
			});
	},
	showCatalog: function (route, subRoute) {
		this.catalogRoute = subRoute;

		this.setTitle ('Catalog');
		this.setActiveView ('catalog-tab-view',
			['groups-tab-view', 'lists-tab-view'],
			'Courses'
		).then (function (item) {
			if (item && item.handleRoute) {
				item.handleRoute (subRoute);
			}
		});

		var me = this;
		getService ().then ((service) => {
			const {href} = service.getCollection ('Courses', 'Catalog');
			service.get(href).then((data) =>{
				const collection = data;
				me.catalog.setProps({collection:collection});
			});

		});
	},
	showFeature: function (route, subRoute) {
		this.catalogRoute = subRoute;

		this.setTitle ('Featured');
		this.setActiveView ('catalog-tab-view',
			['groups-tab-view', 'lists-tab-view'],
			'Featured'
		).then (function (item) {
			if (item && item.handleRoute) {
				item.handleRoute (subRoute);
			}
		});
		var me = this;
		getService ().then ((service) => {
			const {href} = service.getCollection ('Featured', 'Catalog');
			service.get(href).then((data) =>{
				const collection = data;
				me.catalog.setProps({collection:collection});
			});

		});
	},
	showPurchased: function (route, subRoute) {
		this.catalogRoute = subRoute;

		this.setTitle ('Featured');
		this.setActiveView ('catalog-tab-view',
			['groups-tab-view', 'lists-tab-view'],
			'Purchased'
		).then (function (item) {
			if (item && item.handleRoute) {
				item.handleRoute (subRoute);
			}
		});

		var me = this;
		getService ().then ((service) => {
			const {href} = service.getCollection ('Purchased', 'Catalog');
			service.get(href).then((data) =>{
				const collection = data;
				me.catalog.setProps({collection:collection});
			});

		});
	},
	prepareNavigation: function () {
		this.NavigationActions.updateNavBar ({
			cmp: this.getNavigation (),
			hideBranding: true
		});

		this.NavigationActions.setActiveContent (null);
	},
	getNavigation: function () {
		if (!this.navigation || this.navigation.isDestroyed) {
			this.navigation = ComponentsNavigation.create ({
				bodyView: this
			});
		}

		return this.navigation;
	},
	onTabChange: function (title, route, subroute, tab) {
		this.pushRoute (title, route, subroute);
	}
});
