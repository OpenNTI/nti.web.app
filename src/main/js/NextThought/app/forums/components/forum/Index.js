Ext.define('NextThought.app.forums.components.forum.Index', {
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
		this.navigation.pushRoute = this.pushRoute.bind(this);
		this.body.pushRouteState = this.pushRouteState.bind(this);
		this.body.replaceRouteState = this.replaceRouteState.bind(this);
		this.body.alignNavigation = this.alignNavigation.bind(this);
	},


	setForumList: function(forumList) {
		if (!this.forumList) {
			this.forumList = forumList;
			this.navigation.setForumList(forumList);
		}
	},


	setForum: function(id) {
		if (this.body.activeTopic && this.body.activeTopic.getId() === id) {
			return;
		}
		var record = this.navigation.selectRecord(id),
			title = record && record.get('title');

		if (title) {
			this.setTitle(title);
		}

		wait().then(this.alignNavigation.bind(this));

		return this.body.setForum(record);
	}
});
