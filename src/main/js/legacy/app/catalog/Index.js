const Ext = require('@nti/extjs');
const CatalogView = require('@nti/web-catalog').default;
const {getService} = require('@nti/web-client');
const {Router, Route} = require('@nti/web-routing');
const { encodeForURI, isNTIID } = require('@nti/lib-ntiids');

const Globals = require('legacy/util/Globals');
const NavigationActions = require('legacy/app/navigation/Actions');
const ComponentsNavigation = require('legacy/common/components/Navigation');
const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));
const {getString} = require('legacy/util/Localization');

require('legacy/common/components/Navigation');
require('legacy/overrides/ReactHarness');
require('legacy/login/StateStore');
require('legacy/app/library/courses/components/available/CourseWindow');

const PURCHASED_ACTIVE = /^\/purchased/;
const REDEEM_ACTIVE = /^\/redeem/;

const CATALOG_ENTRY_ROUTE = /(.*)\/nti-course-catalog-entry\/(.*)/;
const CATEGORY_NAME = /\/([^/]*)\/?/;

const URI_PART = /^uri/;

function getPathname (a) {
	const pathname = a.pathname;

	if (pathname.charAt(0) !== '/') {
		const href = a.toString();
		const parts = Globals.getURLParts(href);

		return parts.pathname;
	}

	return pathname;
}

const Catalog = Router.for([
	Route({path: '/', component: CatalogView})
]);

module.exports = exports = Ext.define('NextThought.app.catalog.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.catalog-component',
	id: 'catalog-component',

	mixins: {
		Route: 'NextThought.mixins.Router'
	},

	layout: 'none',
	items: [],

	renderTpl: Ext.DomHelper.markup([
		{cls: 'navigation-container'},
		{id: '{id}-body', cn: ['{%this.renderContainer(out,values)%}']}
	]),

	initComponent: function () {
		this.callParent(arguments);

		this.removeCls('make-white');
		this.addCls('course-catalog-body');

		this.initRouter();

		this.addDefaultRoute(this.showCatalog.bind(this));

		this.NavigationActions = NavigationActions.create();
	},


	showCatalog (route) {
		const baseroute = this.getBaseRoute();

		if (this.catalog) {
			this.catalog.setBaseRoute(baseroute);
		} else {
			this.catalog = this.add({
				xtype: 'react',
				component: Catalog,
				baseroute: baseroute,
				setTitle: title => this.setTitle(title),
				getRouteFor: (obj) => {
					if (obj.isCourseCatalogEntry) {
						return `${this.category || '.'}/nti-course-catalog-entry/${obj.getID()}`;
					}
				}
			});
		}

		this.setUpNavigation(baseroute, route.path);
	},

	setUpNavigation () {
		if (!this.navigation || this.navigation.isDestroyed) {
			this.navigation = ComponentsNavigation.create({
				bodyView: this
			});
		}

		this.navigation.updateTitle('Catalog');
		this.navigation.useCommonTabs();

		this.NavigationActions.setActiveContent(null, true, true);
		this.NavigationActions.updateNavBar({
			cmp: this.navigation,
			noLibraryLink: false,
			hideBranding: true,
			onBack: () => this.pushRootRoute('Library', '/library')
		});
	},

	xgetTitleFromRoute (route) {
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

	xsetUpNavigation (baseroute, path) {
		const navigation = this.getNavigation();


		navigation.updateTitle('Catalog');


		const tabs = [
			{
				text: getString('NextThought.view.library.View.course'),
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


	xgetNavigation: function () {
		if (!this.navigation || this.navigation.isDestroyed) {
			this.navigation = ComponentsNavigation.create({
				bodyView: this
			});
		}

		return this.navigation;
	},

	xonTabChange: function (title, route, subroute, tab) {
		this.pushRoute(title, route, subroute);
	},


	xloadCatalogEntry (param, rest) {
		if (rest === 'paymentcomplete') {
			const enrolledURL = Service.getCollection('EnrolledCourses', 'Courses').href;

			return Service.request(`${enrolledURL}?batchSize=1&batchStart=0`)
				.then(resp => {
					const item = lazy.ParseUtils.parseItems(JSON.parse(resp))[0];

					return item.get('CatalogEntry');
				});
		}


		if (isNTIID(param)) {
			return getService()
				.then(service => service.getObjectRaw(param))
				.then(catalog => lazy.ParseUtils.parseItems(catalog)[0]);
		}


		if (URI_PART.test(param)) {
			const href = decodeURIComponent(param).replace('uri:', '');

			return Service.request(href)
				.then(raw => lazy.ParseUtils.parseItems(raw)[0]);

		}

		throw new Error('Unable to resole catalog');
	},


	xmaybeShowCatalogEntry (route, category) {
		const {path} = route;
		const matches = path && path.match(CATALOG_ENTRY_ROUTE);

		if (!matches) {
			if (this.availableWin) {
				this.availableWin.destroy();
				delete this.availableWin;
			}

			return Promise.resolve();
		}

		const [param, ...parts] = matches[2].split('/');
		const rest = parts.join('/');


		return this.loadCatalogEntry(param, rest)
			.then((catalogEntry) => {
				this.availableWin = Ext.widget('library-available-courses-window', {
					isSingle: true,
					doClose: () => {
						this.pushRoute('', category || '/');
					}
				});

				this.availableWin.pushRoute = (title, pushedRoute) => {
					const pushedParts = pushedRoute.split('/');
					const pushedRest = pushedParts.splice(1).join('/');

					const allowNavRequest = this.availableWin.allowNavigation();

					if(allowNavRequest && allowNavRequest.then) {
						allowNavRequest.then(() => {
							this.availableWin.handleRoute(`${encodeForURI(catalogEntry.getId())}/${pushedRest}`, {course: catalogEntry});
						});
					}
					else if(allowNavRequest) {
						this.availableWin.handleRoute(`${encodeForURI(catalogEntry.getId())}/${pushedRest}`, {course: catalogEntry});
					}
				};

				this.availableWin.handleRoute(`${encodeForURI(catalogEntry.getId())}/${rest}`, {course: catalogEntry});
				this.availableWin.show();
			})
			.catch(() => {
				alert('Unable to find course.');
			});
	}
});
