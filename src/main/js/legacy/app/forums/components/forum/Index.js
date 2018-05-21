const Ext = require('@nti/extjs');

require('legacy/common/components/NavPanel');
require('./Navigation');
require('./Forum');


module.exports = exports = Ext.define('NextThought.app.forums.components.forum.Index', {
	extend: 'NextThought.common.components.NavPanel',
	alias: 'widget.forum-view',
	cls: 'topic-list-view',
	navigation: {xtype: 'forums-forum-nav', margin: 0, override: true},
	body: {xtype: 'forums-forum-body'},
	storeCfg: {},
	model: 'NextThought.model.forums.CommunityForum',

	initComponent: function () {
		this.callParent(arguments);
		this.body.onForumDelete = this.onForumDelete.bind(this);
		this.navigation.isSimplified = this.isSimplified.bind(this);
		this.body.isSimplified = this.isSimplified.bind(this);
	},

	onAddedToParentRouter: function () {
		this.navigation.pushRoute = this.pushForum.bind(this);
		this.body.pushRouteState = this.pushRouteState.bind(this);
		this.body.replaceRouteState = this.replaceRouteState.bind(this);
		this.body.getRouteState = this.getRouteState.bind(this);
		this.body.alignNavigation = this.alignNavigation.bind(this);
	},

	clearForum: function () {
		this.forumList = null;
		this.navigation.setForumList(null);
		this.body.clearForum();
	},

	pushForum: function (title, route, precache) {
		var state = this.getRouteState();

		delete state.currentPage;
		delete state.search;

		this.pushRouteState(state, title, route, precache);
	},

	setForumList: function (forumList) {
		this.forumList = forumList;
		this.navigation.setForumList(forumList);
	},


	onForumDelete (record) {
		const store = this.forumList[0].store || ((this.forumList[0].children || [])[0] || {}).store;
		const deletedIndex = store.indexOf(record);
		const size = store.getCount();
		let nextForum;

		if (deletedIndex === size - 1) {
			nextForum = store.getAt(deletedIndex - 1);
		} else {
			nextForum = store.getAt(deletedIndex + 1);
		}

		store.remove([record]);

		if (nextForum) {
			this.setForum(nextForum.getId());
		}
		this.navigation.setForumList(this.forumList);
	},

	isSimplified () {
		return (!this.forumList || this.forumList.length > 1 || this.forumList[0].title !== '') ? false : true;
	},

	setForum: function (id) {
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
