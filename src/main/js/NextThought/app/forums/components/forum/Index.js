export default Ext.define('NextThought.app.forums.components.forum.Index', {
	extend: 'NextThought.common.components.NavPanel',
	alias: 'widget.forum-view',

	cls: 'topic-list-view',

	requires: [
		'NextThought.app.forums.components.forum.Navigation',
		'NextThought.app.forums.components.forum.Forum'
	],

	navigation: {xtype: 'forums-forum-nav', margin: 0, override: true},
	body: {xtype: 'forums-forum-body'},

	storeCfg: {},

	model: 'NextThought.model.forums.CommunityForum',


	initComponent: function() {
		this.callParent(arguments);
	},


	onAddedToParentRouter: function() {
		this.navigation.pushRoute = this.pushForum.bind(this);
		this.body.pushRouteState = this.pushRouteState.bind(this);
		this.body.replaceRouteState = this.replaceRouteState.bind(this);
		this.body.getRouteState = this.getRouteState.bind(this);
		this.body.alignNavigation = this.alignNavigation.bind(this);
	},


	clearForum: function() {
		this.forumList = null;
		this.navigation.setForumList(null);
		this.body.clearForum();
	},


	pushForum: function(title, route, precache) {
		var state = this.getRouteState();

		delete state.currentPage;
		delete state.search;

		this.pushRouteState(state, title, route, precache);
	},


	setForumList: function(forumList) {
		this.forumList = forumList;
		this.navigation.setForumList(forumList);
	},


	setForum: function(id) {
		var record = this.navigation.selectRecord(id),
			title = record && record.get('title');

		if (title) {
			this.setTitle(title);
		}

		if (this.body.activeTopicList && this.body.activeTopicList.getId() === record.getId()) {
			return this.body.updateForum()
				.then(this.alignNavigation.bind(this));
		}

		return this.body.setForum(record)
			.then(this.alignNavigation.bind(this));
	}
});
