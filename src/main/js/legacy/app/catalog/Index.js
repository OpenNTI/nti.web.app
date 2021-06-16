const Ext = require('@nti/extjs');
const CatalogView = require('@nti/web-catalog').default;
const { getService } = require('@nti/web-client');
const { Router, Route } = require('@nti/web-routing');
const { encodeForURI, isNTIID } = require('@nti/lib-ntiids');
const NavigationActions = require('internal/legacy/app/navigation/Actions');
const ComponentsNavigation = require('internal/legacy/common/components/Navigation');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);

require('internal/legacy/common/components/Navigation');
require('internal/legacy/overrides/ReactHarness');
require('internal/legacy/login/StateStore');
require('internal/legacy/app/library/courses/components/available/CourseWindow');

const getCatalogRouteParts = route => {
	const catalogParts = { tag: '', entry: '', rest: '' };
	const routeParts = route.split('/');

	for (let i = 0; i < routeParts.length; i++) {
		if (routeParts[i] === 'tag') {
			catalogParts.tag = routeParts[i + 1];
		} else if (routeParts[i] === 'item') {
			catalogParts.entry = routeParts[i + 1];
			catalogParts.rest = routeParts.slice(i + 2).join('/');
			break;
		}
	}

	return catalogParts;
};

const URI_PART = /^uri/;

const Catalog = Router.for([Route({ path: '/', component: CatalogView })]);

module.exports = exports = Ext.define('NextThought.app.catalog.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.catalog-component',
	id: 'catalog-component',

	mixins: {
		Route: 'NextThought.mixins.Router',
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

	onRouteActivate() {
		clearTimeout(this.routeDeactivateTimeout);
	},

	onRouteDeactivate() {
		clearTimeout(this.routeDeactivateTimeout);

		this.routeDeactivateTimeout = setTimeout(() => {
			if (this.availableWin) {
				this.availableWin.destroy();
				delete this.availableWin;
			}
		}, 100);
	},

	onDestroy() {
		if (this.availableWin) {
			this.availableWin.destroy();
		}
	},

	showCatalog(route) {
		const baseroute = this.getBaseRoute();
		const catalogRouteParts = getCatalogRouteParts(route.path);

		this.category = catalogRouteParts.tag;

		if (this.catalog) {
			this.catalog.setBaseRoute(baseroute);
		} else {
			this.catalog = this.add({
				xtype: 'react',
				component: Catalog,
				baseroute,
				setTitle: title => this.setTitle(title),
				suppressDetails: true,
				getRouteFor: obj => {
					if (obj.isCourseCatalogEntry) {
						let base = '';

						if (this.category) {
							base = `${base}tag/${this.category}`;
						} else {
							base = '.';
						}

						base = `${base}/item/${obj.getID()}`;

						return base;
					}
				},
			});
		}

		this.setUpNavigation(baseroute, route.path);
		return this.maybeShowCatalogEntry(catalogRouteParts, this.category);
	},

	setUpNavigation(baseroute, path) {
		const navigation = this.getNavigation();

		navigation.updateTitle('Catalog');
		navigation.useCommonTabs();

		this.NavigationActions.setActiveContent(null, true, true);
		this.NavigationActions.updateNavBar({
			cmp: navigation,
			noLibraryLink: false,
			hideBranding: true,
			onBack: () => this.pushRootRoute('Library', '/library'),
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

	loadCatalogEntry(param, rest) {
		if (rest === 'paymentcomplete') {
			const enrolledURL = Service.getCollection(
				'EnrolledCourses',
				'Courses'
			).href;

			return Service.request(
				`${enrolledURL}?batchSize=1&batchStart=0`
			).then(resp => {
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

			return Service.request(href).then(
				raw => lazy.ParseUtils.parseItems(raw)[0]
			);
		}

		throw new Error('Unable to resole catalog');
	},

	async maybeShowCatalogEntry(catalogRouteParts, category) {
		const { entry, rest } = catalogRouteParts;

		if (!catalogRouteParts.entry) {
			if (this.availableWin) {
				this.availableWin.destroy();
				delete this.availableWin;
			}

			return;
		}

		this.__loadTask = this.__loadTask || {};

		if (this.__loadTask[entry]) {
			return;
		}

		this.__loadTask[entry] = this.loadCatalogEntry(entry, rest).catch(
			() => {
				alert('Unable to find course.');
			}
		);

		const catalogEntry = await this.__loadTask[entry];

		delete this.__loadTask[entry];

		if (!catalogEntry) {
			return;
		}

		this.availableWin = Ext.widget('library-available-courses-window', {
			isSingle: true,
			doClose: () => {
				this.pushRoute('', category ? `/tag/${category}` : '/');
			},
		});

		this.availableWin.pushRoute = (title, pushedRoute) => {
			const pushedParts = pushedRoute.split('/');
			const pushedRest = pushedParts.splice(1).join('/');

			const allowNavRequest = this.availableWin.allowNavigation();

			if (allowNavRequest && allowNavRequest.then) {
				allowNavRequest.then(() => {
					this.availableWin.handleRoute(
						`${encodeForURI(catalogEntry.getId())}/${pushedRest}`,
						{ course: catalogEntry }
					);
				});
			} else if (allowNavRequest) {
				this.availableWin.handleRoute(
					`${encodeForURI(catalogEntry.getId())}/${pushedRest}`,
					{ course: catalogEntry }
				);
			}
		};

		this.availableWin.handleRoute(
			`${encodeForURI(catalogEntry.getId())}/${rest}`,
			{ course: catalogEntry }
		);
		this.availableWin.show();

		this.availableWin.el.setStyle({ 'z-index': 1 });
	},
});
