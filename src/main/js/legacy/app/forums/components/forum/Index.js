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

	initComponent () {
		this.callParent(arguments);
		this.body.onForumDelete = this.onForumDelete.bind(this);
		this.body.isSimplified = this.isSimplified.bind(this);
	},

	onAddedToParentRouter () {
		this.navigation.pushRoute = this.pushForum.bind(this);
		this.body.pushRouteState = this.pushRouteState.bind(this);
		this.body.replaceRouteState = this.replaceRouteState.bind(this);
		this.body.getRouteState = this.getRouteState.bind(this);
		this.body.alignNavigation = this.alignNavigation.bind(this);
		this.navigation.setInitForum = this.setInitForum;
	},

	pushForum (title, route, precache) {
		var state = this.getRouteState();

		delete state.currentPage;
		delete state.search;

		this.pushRouteState(state, title, route, precache);
	},

	setCurrentBundle (bundle) {
		this.navigation.setCurrentBundle(bundle);
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
		const nextSize = store.getCount();

		if (nextForum && nextSize > 0) {
			this.setForum(nextForum.getId());
		} else if  (nextSize === 0) {
			// assume they are an editor if they just deleted a forum
			this.setEmptyState(true);
		}
	},

	isSimplified () {
		return (!this.forumList || this.forumList.length === 0 || this.forumList.length > 1 || this.forumList[0].title !== '') ? false : true;
	},

	setForum (record) {
		const title = record && record.get('title');

		if (title) {
			this.setTitle(title);
		}

		this.navigation.scrollToActive();
		this.navigation.setActiveForum(record.getId());

		if (this.body.activeTopicList && this.body.activeTopicList.getId() === record.getId()) {
			return this.body.updateForum()
				.then(this.alignNavigation.bind(this));
		}

		return this.body.setForum(record)
			.then(this.alignNavigation.bind(this));
	},

	setEmptyState (isEditor) {
		this.body.setEmpty(isEditor);
	}
});
