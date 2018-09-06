const {isFeature} = require('legacy/util/Globals');

const Library = require('./Library');
const LibrarySearchable = require('./LibrarySearchable');

if(isFeature('library-searchable')) {
	module.exports = exports = LibrarySearchable;
} else {
	module.exports = exports = Library;
}

// module.exports = exports = Ext.define('NextThought.app.library.Index', {
// 	extend: 'Ext.container.Container',
// 	alias: 'widget.library-view-container',
//
// 	mixins: {
// 		Router: 'NextThought.mixins.Router'
// 	},
//
// 	layout: 'none',
// 	cls: 'library-view',
// 	items: [],
//
// 	initComponent: function () {
// 		this.callParent(arguments);
//
// 		this.initRouter();
//
// 		this.addDefaultRoute(this.showLibrary.bind(this));
//
// 		this.NavigationActions = NavigationActions.create();
// 		this.CourseActions = CourseActions.create();
// 		this.BundleActions = BundleActions.create();
// 	},
//
// 	showLibrary (route) {
// 		this.NavigationActions.updateNavBar({
// 			noLibraryLink: true,
// 			darkStyle: true
// 		});
//
// 		this.NavigationActions.setActiveContent(null);
//
// 		const baseroute = this.getBaseRoute();
//
// 		if (this.library) {
// 			this.library.setBaseRoute(baseroute);
// 		} else {
// 			this.library = this.add({
// 				xtype: 'react',
// 				component: LibrarySearchableView,
// 				baseroute: baseroute,
// 				setTitle: (title) => {this.setTitle(title); },
// 				getRouteFor: (obj) => {
// 					if (obj.MimeType === 'application/vnd.nextthought.community') {
// 						return () => this.navigateToCommunity(obj);
// 					} else if (obj.isCourse) {
// 						return () => this.navigateToCourse(obj);
// 					} else if (obj.isBundle) {
// 						return () => this.navigateToBundle(obj);
// 					} else if (obj.isCourseCatalogEntry) {
// 						return () => this.navigateToCatalog(obj);
// 					}
// 				}
// 			});
// 		}
//
// 		this.setTitle('Home');
// 	},
//
// 	navigateToCatalog (catalogEntry) {
// 		debugger;
// 		const href = `uri:${catalogEntry.href}`;
//
// 		const route = `./nti-course-catalog-entry/${encodeURIComponent(href)}`;
// 		this.pushRootRoute(null, route);
// 	},
//
// 	navigateToCommunity (community) {
// 		let route;
// 		var id = community.Username;
// 		if (id && community.getLink('Activity')) {
// 			route = '/community/' + encodeURIComponent(id);
// 		}
//
// 		if (route) {
// 			this.pushRootRoute(null, route, {community: community});
// 		}
// 	},
//
//
// 	navigateToCourse (course) {
// 		const courseID = course.getCourseID ? course.getCourseID() : course.NTIID;
//
// 		this.CourseActions.transitionToCourse(courseID)
// 			.then(route => {
// 				this.pushRootRoute(null, route);
// 			});
// 	},
//
//
// 	navigateToBundle (bundle) {
// 		const bundleID = bundle.getID ? bundle.getID() : bundle.NTIID;
//
// 		this.BundleActions.transitionToBundle(bundleID)
// 			.then(route => {
// 				this.pushRootRoute(null, route);
// 			});
// 	}
// });
