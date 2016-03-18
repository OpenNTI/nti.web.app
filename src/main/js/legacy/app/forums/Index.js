var Ext = require('extjs');
var ParseUtils = require('../../util/Parsing');
var MixinsRouter = require('../../mixins/Router');
var ForumIndex = require('./components/forum/Index');
var TopicWindow = require('./components/topic/Window');
var ForumsBase = require('../../model/forums/Base');
var ForumsBoard = require('../../model/forums/Board');
var ForumsCommentPost = require('../../model/forums/CommentPost');
var ForumsCommunityBoard = require('../../model/forums/CommunityBoard');
var ForumsCommunityForum = require('../../model/forums/CommunityForum');
var ForumsCommunityHeadlinePost = require('../../model/forums/CommunityHeadlinePost');
var ForumsCommunityHeadlineTopic = require('../../model/forums/CommunityHeadlineTopic');
var ForumsContentBoard = require('../../model/forums/ContentBoard');
var ForumsContentCommentPost = require('../../model/forums/ContentCommentPost');
var ForumsContentForum = require('../../model/forums/ContentForum');
var ForumsContentHeadlinePost = require('../../model/forums/ContentHeadlinePost');
var ForumsContentHeadlineTopic = require('../../model/forums/ContentHeadlineTopic');
var ForumsDFLBoard = require('../../model/forums/DFLBoard');
var ForumsDFLForum = require('../../model/forums/DFLForum');
var ForumsDFLHeadlinePost = require('../../model/forums/DFLHeadlinePost');
var ForumsDFLHeadlineTopic = require('../../model/forums/DFLHeadlineTopic');
var ForumsForum = require('../../model/forums/Forum');
var ForumsHeadlinePost = require('../../model/forums/HeadlinePost');
var ForumsHeadlineTopic = require('../../model/forums/HeadlineTopic');
var ForumsPersonalBlog = require('../../model/forums/PersonalBlog');
var ForumsPersonalBlogEntry = require('../../model/forums/PersonalBlogEntry');
var ForumsPersonalBlogEntryPost = require('../../model/forums/PersonalBlogEntryPost');
var ForumsPost = require('../../model/forums/Post');
var ForumsTopic = require('../../model/forums/Topic');


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
