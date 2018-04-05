const Ext = require('extjs');
const CatalogView = require('nti-web-catalog');
const { encodeForURI } = require('nti-lib-ntiids');

const Globals = require('legacy/util/Globals');
const NavigationActions = require('legacy/app/navigation/Actions');
const ComponentsNavigation = require('legacy/common/components/Navigation');
const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));

require('legacy/common/components/Navigation');
require('legacy/overrides/ReactHarness');
require('legacy/login/StateStore');
require('legacy/app/library/courses/components/available/CourseWindow');

const PURCHASED_ACTIVE = /^\/purchased/;
const REDEEM_ACTIVE = /^\/redeem/;

const CATALOG_ENTRY_ROUTE = /(.*)\/nti-course-catalog-entry\/(.*)/;

function getPathname (a) {
	const pathname = a.pathname;

	if (pathname.charAt(0) !== '/') {
		const href = a.toString();
		const parts = Globals.getURLParts(href);

		return parts.pathname;
	}

	return pathname;
}

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


	onDestroy () {
		if (this.availableWin) {
			this.availableWin.destroy();
		}
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

	showCatalog (route) {
		const baseroute = this.getBaseRoute();

		this.maybeShowCatalogEntry(route);

		if (this.catalog) {
			this.catalog.setBaseRoute(baseroute);
		} else {
			this.catalog = this.add({
				xtype: 'react',
				component: CatalogView,
				baseroute: baseroute,
				getRouteFor: (obj) => {
					if (obj.isCourseCatalogEntry) {
						const href = `uri:${obj.href}`;

						return `nti-course-catalog-entry/${encodeURIComponent(href)}`;
					}
				}
			});
		}
		const title = this.getTitleFromRoute(route.path);
		this.setTitle(title);

		this.setUpNavigation(baseroute, route.path);
	},

	getTitleFromRoute (route) {
		if (route === '/') {
			return 'Catalog';
		}
		else if (route === '/purchased' || route === '/redeem') {
			return route[1].toUpperCase() + route.substr(2);
		}
		else if (route === '/.nti_other') {
			return 'OTHERS';
		}

		const decodeTitle = decodeURIComponent(route);
		return decodeTitle.substr(1).toUpperCase();
	},

	setUpNavigation (baseroute, path) {
		const navigation = this.getNavigation();


		navigation.updateTitle('Catalog');


		const tabs = [
			{
				text: 'Courses',
				route: '/',
				active: !PURCHASED_ACTIVE.test(path) && !REDEEM_ACTIVE.test(path)
			},
			{
				text: 'History',
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
	},


	maybeShowCatalogEntry (route) {
		const {path} = route;
		const matches = path && path.match(CATALOG_ENTRY_ROUTE);

		if (!matches) {
			if (this.availableWin) {
				this.availableWin.destroy();
				delete this.availableWin;
			}

			return;
		}

		const parts = matches[2].split('/');
		const href = decodeURIComponent(parts[0]);
		const rest = parts.slice(1).join('/');

		Service.request(href.replace(/^uri:/, ''))
			.then(resp => lazy.ParseUtils.parseItems(resp)[0])
			.then((catalogEntry) => {
				this.availableWin = Ext.widget('library-available-courses-window', {
					isSingle: true,
					doClose: () => {
						if (route.precache.closeURL) {
							this.pushRootRoute('', route.precache.closeURL);
						} else {
							this.pushRoute('', '/');
						}
					}
				});

				this.availableWin.pushRoute = (title, route) => {
					const pushedParts = route.split('/');
					const pushedRest = parts.splice(1).join('/');

					this.availableWin.handleRoute(`${encodeForURI(catalogEntry.getId())}/${rest}`, {course: catalogEntry});
				};

				this.availableWin.handleRoute(`${encodeForURI(catalogEntry.getId())}/${rest}`, {course: catalogEntry});
				this.availableWin.show();
			});
	}
});
