const Ext = require('@nti/extjs');
const { decodeFromURI } = require('@nti/lib-ntiids');

const Forum = require('legacy/model/forums/Forum');

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

	initComponent () {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/', this.showForum.bind(this));
		this.addRoute('/:forum', this.showForum.bind(this));
		this.addDefaultRoute('/');

		this.forumView = this.down('forum-view');
	},

	onAddedToParentRouter () {
		this.forumView.pushRoute = this.pushRoute.bind(this);
		this.forumView.pushRouteState = this.pushForumState.bind(this);
		this.forumView.replaceRouteState = this.replaceForumState.bind(this);
		this.forumView.getRouteState = this.getRouteState.bind(this);
		this.forumView.setTitle = this.setTitle.bind(this);
		this.forumView.setInitForum = this.setInitForum.bind(this);
		this.forumView.onAddedToParentRouter();
	},

	replaceForumState (state, title, route, precache) {
		route = route || this.getCurrentRoute();

		this.replaceRouteState(state, title, route, precache);
	},

	pushForumState (state, title, route, precache) {
		route = route || this.getCurrentRoute();

		this.pushRouteState(state, title, route, precache);
	},

	setCurrentBundle (bundle) {
		delete this.activeForum;
		this.forumView.setCurrentBundle(bundle);
	},

	showForum (route) {
		const { precache: { forum }, params: { forum: forumID } } = route;
		const id = forumID && decodeFromURI(forumID);

		if (forum && forum !== this.activeForum) {
			// Forum clicked on nav
			this.setActiveForum(forum);
		} else if (id && !forum && ((this.activeForum && this.activeForum.getId() !== id) || !this.activeForum)) {
			// Load forum
			this.getForum(id);
		} else if (this.activeForum) {
			// Reset active forum
			this.setActiveForum(this.activeForum);
		} else {
			// Clear Forum
			this.forumView.setEmptyState();
		}
	},

	async getForum (forumID) {
		try {
			const forum = await Service.getObject(forumID);
			this.setActiveForum(forum);
		} catch (error) {
			console.error(error);
		}
	},

	setInitForum (forum) {
		this.setActiveForum(Forum.interfaceToModel(forum));
	},

	setActiveForum (forum) {
		this.activeForum = forum;
		this.forumView.setForum(this.activeForum);
	}
});
