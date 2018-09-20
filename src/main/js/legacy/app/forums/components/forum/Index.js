const Ext = require('@nti/extjs');
const { decodeFromURI } = require('@nti/lib-ntiids');
const { dispatch } = require('@nti/lib-dispatcher');
const { scoped } = require('@nti/lib-locale');

require('legacy/common/components/NavPanel');
require('./Navigation');
require('./Forum');

const FORUM_LIST_REFRESH = 'FORUM_LIST_REFRESH';

const DEAFULT_TEXT = {
	title: 'Not found.',
	message: 'Unable to find forum.'
};

const t = scoped('nti.web.disscussions.forums.emptytopiclist', DEAFULT_TEXT);

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
			Ext.Msg.show({
				msg: t('message'),
				title: t('title'),
				icon: 'warning-yellow',
				buttons: {
					primary: {
						text: 'Okay',
						handler: async () => {}
					}
				}
			});
			dispatch(FORUM_LIST_REFRESH);
			this.setEmptyState();
			this.replaceRouteState(null, '', '/');
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
