const Ext = require('@nti/extjs');

require('legacy/mixins/Router');
require('legacy/app/forums/Index');


module.exports = exports = Ext.define('NextThought.app.content.forum.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.bundle-forum',
	layout: 'none',
	title: 'Discussions',
	cls: 'course-forum',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	statics: {
		showTab: function (bundle) {
			return bundle && bundle.hasForumList && bundle.hasForumList();
		}
	},

	items: [
		{xtype: 'forum-container'}
	],

	initComponent: function () {
		this.callParent(arguments);

		this.forumContainer = this.down('forum-container');

		this.addChildRouter(this.forumContainer);

		this.initRouter();

		this.addDefaultRoute(this.onRoute.bind(this));
	},

	getRouteTitle: function () {
		return this.title;
	},

	onActivate: function () {
		this.setTitle(this.title);
	},

	bundleChanged: function (bundle) {
		var container = this.forumContainer;

		if (this.currentBundle === bundle) { return; }

		this.currentBundle = bundle;
		container.clearForumList();

		return bundle.getForumList()
			.then(container.setForumList.bind(container));
	},

	onRoute: function (route, subRoute) {
		return this.forumContainer.handleRoute(route.path, route.precache);
	}
});
