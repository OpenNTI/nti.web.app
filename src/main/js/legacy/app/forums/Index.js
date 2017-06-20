const Ext = require('extjs');
const { decodeFromURI } = require('nti-lib-ntiids');

require('legacy/mixins/Router');
require('legacy/model/forums/Base');
require('legacy/model/forums/Board');
require('legacy/model/forums/CommentPost');
require('legacy/model/forums/CommunityBoard');
require('legacy/model/forums/CommunityForum');
require('legacy/model/forums/CommunityHeadlinePost');
require('legacy/model/forums/CommunityHeadlineTopic');
require('legacy/model/forums/ContentBoard');
require('legacy/model/forums/ContentCommentPost');
require('legacy/model/forums/ContentForum');
require('legacy/model/forums/ContentHeadlinePost');
require('legacy/model/forums/ContentHeadlineTopic');
require('legacy/model/forums/DFLBoard');
require('legacy/model/forums/DFLForum');
require('legacy/model/forums/DFLHeadlinePost');
require('legacy/model/forums/DFLHeadlineTopic');
require('legacy/model/forums/Forum');
require('legacy/model/forums/HeadlinePost');
require('legacy/model/forums/HeadlineTopic');
require('legacy/model/forums/PersonalBlog');
require('legacy/model/forums/PersonalBlogEntry');
require('legacy/model/forums/PersonalBlogEntryPost');
require('legacy/model/forums/Post');
require('legacy/model/forums/Topic');
require('legacy/util/Parsing');

require('./components/forum/Index');
require('./components/topic/Window');


module.exports = exports = Ext.define('NextThought.app.forums.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.forum-container',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	isForumContainer: true,
	layout: 'none',

	items: [
		{xtype: 'forum-view'}
	],

	initComponent: function () {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/', this.showForum.bind(this));
		this.addRoute('/:forum', this.showForum.bind(this));
		this.addDefaultRoute('/');

		this.forumView = this.down('forum-view');
	},

	onAddedToParentRouter: function () {
		this.forumView.pushRoute = this.pushRoute.bind(this);
		this.forumView.pushRouteState = this.pushForumState.bind(this);
		this.forumView.replaceRouteState = this.replaceForumState.bind(this);
		this.forumView.getRouteState = this.getRouteState.bind(this);
		this.forumView.setTitle = this.setTitle.bind(this);
		this.forumView.onAddedToParentRouter();
	},

	replaceForumState: function (state, title, route, precache) {
		route = route || this.getCurrentRoute();

		this.replaceRouteState(state, title, route, precache);
	},

	pushForumState: function (state, title, route, precache) {
		route = route || this.getCurrentRoute();

		this.pushRouteState(state, title, route, precache);
	},

	clearForumList: function () {
		this.forumView.clearForum();
	},

	/**
	 * Take a forum list or a promise that fulfills with a forum list
	 * @param {Array|Object} forumList see comments in the CourseInstance model to see structure
	 * @returns {void}
	 */
	setForumList: function (forumList) {
		this.forumView.setForumList(null);
		delete this.forumView.forumList;
		this['get_forum_list'] = forumList instanceof Promise ? forumList : Promise.resolve(forumList);
	},

	getForumList: function () {
		return this['get_forum_list'] || Promise.reject('No forum list defined');
	},

	showForum: function (route, subRoute) {
		var me = this;

		return me.getForumList()
			.then(function (forumList) {
				var id = route.params.forum;

				id = id && decodeFromURI(id);

				me.forumView.setForumList(forumList);
				me.forumView.setForum(id);
			});
	}
});
