const Ext = require('@nti/extjs');
const { View: LibrarySearchableView } = require('@nti/web-library');
const { Theme } = require('@nti/web-commons');
const NavigationActions = require('internal/legacy/app/navigation/Actions');
const BundleActions = require('internal/legacy/app/bundle/Actions');
const CourseActions = require('internal/legacy/app/course/Actions');

const GlobalTheme = Theme.getGlobalTheme();

require('internal/legacy/mixins/Router');

module.exports = exports = Ext.define('NextThought.app.library.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-view-container',

	mixins: {
		Router: 'NextThought.mixins.Router',
	},

	layout: 'none',
	cls: 'library-view',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		this.initRouter();

		this.addDefaultRoute(this.showLibrary.bind(this));

		this.NavigationActions = NavigationActions.create();
		this.CourseActions = CourseActions.create();
		this.BundleActions = BundleActions.create();
	},

	onRouteDeactivate() {
		this.deactivateTimeout = setTimeout(() => {
			this.library?.destroy?.();
			delete this.library;
		}, 300);
	},

	showLibrary(route) {
		const LibraryTheme = GlobalTheme.scope('library');
		const { background } = LibraryTheme;
		const dark = background == null ? true : background === 'dark';

		this.NavigationActions.updateNavBar({
			noLibraryLink: false,
			darkStyle: dark,
			theme: LibraryTheme.scope('navigation'),
			themeScope: 'library.navigation',
		});

		if (this.deactivateTimeout) {
			clearTimeout(this.deactivateTimeout);
			delete this.deactivateTimeout;
		}

		this.NavigationActions.setActiveContent(null, !dark, !dark);

		const baseroute = this.getBaseRoute();

		if (this.library) {
			this.library.setBaseRoute(baseroute);
		} else {
			this.library = this.add({
				xtype: 'react',
				component: LibrarySearchableView,
				baseroute: baseroute,
				setTitle: title => {
					this.setTitle(title);
				},
				getRouteFor: (obj, context) => {
					if (
						obj.MimeType === 'application/vnd.nextthought.community'
					) {
						return () => this.navigateToCommunity(obj);
					} else if (obj.isCourse) {
						return () => this.navigateToCourse(obj, context);
					} else if (obj.isBundle) {
						return () => this.navigateToBundle(obj);
					} else if (obj.isCourseCatalogEntry) {
						return () => this.navigateToCatalog(obj);
					}
				},
			});
		}

		if (route.path === '/admin-courses') {
			this.setTitle('Your Admin Courses');
		} else if (route.path === '/courses') {
			this.setTitle('Your Courses');
		} else {
			this.setTitle('Home');
		}
	},

	navigateToCatalog(catalogEntry) {
		const href = `uri:${catalogEntry.href}`;

		const route = `./nti-course-catalog-entry/${encodeURIComponent(href)}`;
		this.pushRootRoute('Loading', route);
	},

	navigateToCommunity(community) {
		let route;
		var id = community.Username;
		if (id && community.getLink('Activity')) {
			route = '/community/' + encodeURIComponent(id);
		}

		if (route) {
			this.pushRootRoute(community.Username, route, { community: community });
		}
	},

	navigateToCourse(course, context) {
		const courseID = course.getCourseID
			? course.getCourseID()
			: course.CourseNTIID || course.NTIID;
		const part =
			context === 'new-course' || context === 'edit' ? 'info' : '';

		this.CourseActions.transitionToCourse(courseID, null, part).then(
			route => {
				this.pushRootRoute(course?.CatalogEntry?.title ?? '', route);
			}
		);
	},

	navigateToBundle(bundle) {
		const bundleID = bundle.getID ? bundle.getID() : bundle.NTIID;

		this.BundleActions.transitionToBundle(bundleID).then(route => {
			this.pushRootRoute(null, route);
		});
	},
});
