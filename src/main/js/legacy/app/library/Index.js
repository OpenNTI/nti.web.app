var Ext = require('extjs');
var MixinsRouter = require('../../mixins/Router');
var NavigationActions = require('../navigation/Actions');
var CommunitiesIndex = require('./communities/Index');
var AdminIndex = require('./admin/Index');
var ContentIndex = require('./content/Index');
var CoursesIndex = require('./courses/Index');
var LibraryHome = require('./Home');


module.exports = exports = Ext.define('NextThought.app.library.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-view-container',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'card',
	cls: 'library-view',
	items: [],

	initComponent: function() {
		this.callParent(arguments);

		this.NavActions = NextThought.app.navigation.Actions.create();

		this.addRoute('/', this.showHome.bind(this));
		this.addRoute('/courses', this.showCourses.bind(this));
		this.addRoute('/admin', this.showAdminCourses.bind(this));
		this.addRoute('/books', this.showBooks.bind(this));
		this.addRoute('/communities', this.showCommunities.bind(this));
		this.addDefaultRoute('/');

		this.on({
			deactivate: this.onDeactivate.bind(this)
		});
	},

	onDeactivate: function() {
		var activeItem = this.getLayout().getActiveItem();

		activeItem.fireEvent('deactivate');
	},

	setActiveView: function(xtype, selector) {
		var old = this.getLayout().getActiveItem(),
			cmp = this.down(selector || xtype);

		if (!cmp) {
			cmp = this.add(Ext.widget(xtype));

			this.addChildRouter(cmp);
		}

		this.getLayout().setActiveItem(cmp);

		this.NavActions.updateNavBar({
			noLibraryLink: xtype === 'library-home',
			darkStyle: true
		});

		this.NavActions.setActiveContent(null);

		//If this is the first element added, the card layout
		//wont' fire the activate event so trigger it ourselves.
		if (!old) {
			cmp.fireEvent('activate');
		}


		return cmp;
	},

	showHome: function(route, subRoute) {
		var cmp = this.setActiveView('library-home');

		this.setTitle('Home');

		return cmp.handleRoute(subRoute, route.precache);
	},

	showCourses: function(route, subRoute) {
		var cmp = this.setActiveView('library-courses', '[isCoursePage]');

		return cmp.handleRoute(subRoute, route.precache);
	},

	showAdminCourses: function(route, subRoute) {
		var cmp = this.setActiveView('library-admin');

		return cmp.handleRoute(subRoute, route.precache);
	},

	showBooks: function(route, subRoute) {
		var cmp = this.setActiveView('library-content');

		return cmp.handleRoute(subRoute, route.precache);
	},

	showCommunities: function(route, subRoute) {
		var cmp = this.setActiveView('library-communities');

		return cmp.handleRoute(subRoute, route.precache);
	}
});
