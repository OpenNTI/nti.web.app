const Ext = require('@nti/extjs');
const { Forums } = require('@nti/web-discussions');
const { dispatch } = require('@nti/lib-dispatcher');

require('./parts/FilterBar');
require('./parts/Header');
require('./parts/TopicListView');

const FORUM_LIST_REFRESH = 'FORUM_LIST_REFRESH';

module.exports = exports = Ext.define('NextThought.app.forums.components.forum.Forum', {
	extend: 'Ext.container.Container',
	alias: 'widget.forums-forum-body',
	layout: 'none',
	cls: 'topic-list-body forum-body',

	storeCfg: {
		pageSize: 10
	},

	clearForum () {
		const topicList = this.down('forums-forum-topic-list-view');
		const filterBar = this.down('forums-forum-filterbar');
		const header = this.down('forums-forum-header');

		this.activeTopicList = null;
		Ext.destroy(topicList, filterBar, header);
	},

	setEmpty (isEditor) {
		this.clearForum();
		if (!this.emptyForum) {
			this.emptyForum = this.add({
				xtype: 'react',
				component: Forums.EmptyTopicList,
				isEditor
			});
		}
	},

	setForum (record) {
		let topicList = this.down('forums-forum-topic-list-view');
		let filterBar = this.down('forums-forum-filterbar');
		let header = this.down('forums-forum-header');

		const store = record && record.buildContentsStore('topic-list-view', this.storeCfg);

		if (!record) {
			Ext.destroy(topicList, filterBar, header);
			return Promise.reject();
		}

		if (topicList && topicList.record === record) {
			return Promise.resolve();
		}

		this.store = store;

		Ext.destroy(topicList, filterBar, header, this.emptyForum);
		delete this.emptyForum;

		filterBar = this.add({xtype: 'forums-forum-filterbar'});
		header = this.add({
			xtype: 'forums-forum-header',
			record: record,
			store: store,
			replaceRouteState: this.replaceRouteState,
			onEdit: () => { this.onEdit(); }
		});
		topicList = this.add({
			xtype: 'forums-forum-topic-list-view',
			record: record,
			store: store,
			filterBar: filterBar,
			header: header,
			replaceRouteState: this.replaceRouteState.bind(this),
			pushRouteState: this.pushRouteState.bind(this)
		});

		this.activeTopicList = record;

		return topicList.restoreState(this.getRouteState());
	},

	onEdit () {
		this.editor = this.add({
			xtype: 'react',
			component: Forums.Editor,
			title: this.activeTopicList.get('title'),
			onSubmit: async (payload) => {
				const object = await this.activeTopicList.getInterfaceInstance();
				await object.edit(payload);

				this.activeTopicList.updateFromServer();

				dispatch(FORUM_LIST_REFRESH);

				this.editor.destroy();
				delete this.editor;
			},
			onBeforeDismiss: () => {
				this.editor.destroy();
				delete this.editor;
			},
			isEditing: true
		});
	},

	updateForum () {
		const topicList = this.down('forums-forum-topic-list-view');

		if (!topicList) {
			return Promise.resolve();
		}

		return topicList.restoreState(this.getRouteState());
	}
});
