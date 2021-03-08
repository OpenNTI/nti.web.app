const Ext = require('@nti/extjs');
const { encodeForURI } = require('@nti/lib-ntiids');
const Forum = require('internal/legacy/model/forums/Forum');

require('internal/legacy/mixins/Router');
require('internal/legacy/model/forums/Base');
require('internal/legacy/model/forums/Board');
require('internal/legacy/model/forums/CommentPost');
require('internal/legacy/model/forums/CommunityBoard');
require('internal/legacy/model/forums/CommunityForum');
require('internal/legacy/model/forums/CommunityHeadlinePost');
require('internal/legacy/model/forums/CommunityHeadlineTopic');
require('internal/legacy/model/forums/ContentBoard');
require('internal/legacy/model/forums/ContentCommentPost');
require('internal/legacy/model/forums/ContentForum');
require('internal/legacy/model/forums/ContentHeadlinePost');
require('internal/legacy/model/forums/ContentHeadlineTopic');
require('internal/legacy/model/forums/DFLBoard');
require('internal/legacy/model/forums/DFLForum');
require('internal/legacy/model/forums/DFLHeadlinePost');
require('internal/legacy/model/forums/DFLHeadlineTopic');
require('internal/legacy/model/forums/Forum');
require('internal/legacy/model/forums/HeadlinePost');
require('internal/legacy/model/forums/HeadlineTopic');
require('internal/legacy/model/forums/PersonalBlog');
require('internal/legacy/model/forums/PersonalBlogEntry');
require('internal/legacy/model/forums/PersonalBlogEntryPost');
require('internal/legacy/model/forums/Post');
require('internal/legacy/model/forums/Topic');
require('internal/legacy/util/Parsing');

require('./components/forum/Index');
require('./components/topic/Window');

module.exports = exports = Ext.define('NextThought.app.forums.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.forum-container',

	mixins: {
		Router: 'NextThought.mixins.Router',
	},

	isForumContainer: true,
	layout: 'none',

	items: [{ xtype: 'forum-view' }],

	initComponent() {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/', this.showForum.bind(this));
		this.addRoute('/:forum', this.showForum.bind(this));
		this.addDefaultRoute('/');

		this.forumView = this.down('forum-view');
	},

	onAddedToParentRouter() {
		this.forumView.pushRoute = this.pushRoute.bind(this);
		this.forumView.pushRouteState = this.pushForumState.bind(this);
		this.forumView.replaceRouteState = this.replaceForumState.bind(this);
		this.forumView.getRouteState = this.getRouteState.bind(this);
		this.forumView.setTitle = this.setTitle.bind(this);
		this.forumView.setFirstForum = this.setFirstForum.bind(this);
		this.forumView.getBaseRoute = this.getBaseRoute.bind(this);
		this.forumView.onAddedToParentRouter();
	},

	replaceForumState(state, title, route, precache) {
		route = route || this.getCurrentRoute();

		this.replaceRouteState(state, title, route, precache);
	},

	pushForumState(state, title, route, precache) {
		route = route || this.getCurrentRoute();

		this.pushRouteState(state, title, route, precache);
	},

	setCurrentBundle(bundle) {
		this.forumView.setCurrentBundle(bundle);
	},

	showForum(route) {
		const {
			params: { forum },
		} = route;

		if (forum) {
			this.forumView.loadForum(forum);
		} else {
			this.forumView.setActiveForum(null);
		}
	},

	setFirstForum(forum) {
		if (!forum) {
			this.forumView.setEmptyState();
			return;
		}

		const record = Forum.interfaceToModel(forum);
		const id = encodeForURI(forum.getID());

		this.forumView.setForum(record);
		this.pushRoute(record.get('title'), id);
	},
});
