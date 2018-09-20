const Ext = require('@nti/extjs');
const { decodeFromURI } = require('@nti/lib-ntiids');

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

	onAddedToParentRouter () {
		this.navigation.pushRoute = this.pushForum.bind(this);
		this.navigation.setFirstForum = this.setFirstForum;
		this.body.pushRouteState = this.pushRouteState.bind(this);
		this.body.replaceRouteState = this.replaceRouteState.bind(this);
		this.body.getRouteState = this.getRouteState.bind(this);
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

	async loadForum (id) {
		try {
			const record = await Service.getObject(decodeFromURI(id));
			this.navigation.setActiveForum(id);
			this.setForum(record);
		} catch (error) {
			console.error(error);
		}
	},

	setForum (record) {
		if (!record) { return; }

		const title = record.get('title');

		if (title) {
			this.setTitle(title);
		}

		if (this.body.activeTopicList && this.body.activeTopicList.getId() === record.getId()) {
			return this.body.updateForum();
		}
		this.navigation.setBaseRoute(this.getBaseRoute());
		return this.body.setForum(record);
	},

	setEmptyState (isEditor) {
		this.body.setEmpty(isEditor);
	},

	setActiveForum () {
		this.navigation.setBaseRoute(this.getBaseRoute());
		this.navigation.setActiveForum(null);
	}
});
