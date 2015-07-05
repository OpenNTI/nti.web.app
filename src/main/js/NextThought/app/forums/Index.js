Ext.define('NextThought.app.forums.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.forum-container',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	requires: [
		'NextThought.app.forums.components.forum.Index',
		'NextThought.app.forums.components.topic.Window',
		'NextThought.model.forums.*'
	],

	isForumContainer: true,
	layout: 'none',

	items: [
		{xtype: 'forum-view'}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/', this.showForum.bind(this));
		this.addRoute('/:forum', this.showForum.bind(this));
		this.addDefaultRoute('/');

		this.forumView = this.down('forum-view');
	},


	onAddedToParentRouter: function() {
		this.forumView.pushRoute = this.pushRoute.bind(this);
		this.forumView.pushRouteState = this.pushForumState.bind(this);
		this.forumView.replaceRouteState = this.replaceForumState.bind(this);
		this.forumView.getRouteState = this.getRouteState.bind(this);
		this.forumView.setTitle = this.setTitle.bind(this);
		this.forumView.onAddedToParentRouter();
	},

	replaceForumState: function(state, title, route, precache) {
		route = route || this.getCurrentRoute();

		this.replaceRouteState(state, title, route, precache);
	},


	pushForumState: function(state, title, route, precache) {
		route = route || this.getCurrentRoute();

		this.pushRouteState(state, title, route, precache);
	},


	clearForumList: function() {
		this.forumView.clearForum();
	},


	/**
	 * Take a forum list or a promise that fulfills with a forum list
	 * @param {Array|Object} boardList see comments in the CourseInstance model to see structure
	 */
	setForumList: function(forumList) {
		this.forumView.setForumList(null);
		delete this.forumView.forumList;
		this.get_forum_list = forumList instanceof Promise ? forumList : Promise.resolve(forumList);
	},


	getForumList: function() {
		return this.get_forum_list || Promise.reject('No forum list defined');
	},


	showForum: function(route, subRoute) {
		var me = this;

		return me.getForumList()
			.then(function(forumList) {
				var id = route.params.forum;

				id = id && ParseUtils.decodeFromURI(id);

				me.forumView.setForumList(forumList);
				me.forumView.setForum(id);
			});
	}
});
