const Ext = require('@nti/extjs');

require('./parts/FilterBar');
require('./parts/Header');
require('./parts/TopicListView');


module.exports = exports = Ext.define('NextThought.app.forums.components.forum.Forum', {
	extend: 'Ext.container.Container',
	alias: 'widget.forums-forum-body',
	layout: 'none',
	cls: 'topic-list-body forum-body',

	storeCfg: {
		pageSize: 10
	},

	clearForum: function () {
		var topicList = this.down('forums-forum-topic-list-view'),
			filterBar = this.down('forums-forum-filterbar'),
			header = this.down('forums-forum-header');

		this.activeTopicList = null;
		Ext.destroy(topicList, filterBar, header);
	},

	setForum: function (record) {
		var topicList = this.down('forums-forum-topic-list-view'),
			filterBar = this.down('forums-forum-filterbar'),
			header = this.down('forums-forum-header'),
			store = record && record.buildContentsStore('topic-list-view', this.storeCfg);

		if (!record) {
			Ext.destroy(topicList, filterBar, header);
			return Promise.reject();
		}

		if (topicList && topicList.record === record) {
			return Promise.resolve();
		}

		this.store = store;

		Ext.destroy(topicList, filterBar, header);

		filterBar = this.add({xtype: 'forums-forum-filterbar'});
		header = this.add({
			xtype: 'forums-forum-header',
			record: record,
			store: store,
			onDelete: this.onForumDelete,
			isSimplified: this.isSimplified
		});
		topicList = this.add({
			xtype: 'forums-forum-topic-list-view',
			record: record,
			store: store,
			filterBar: filterBar,
			header: header,
			alignNavigation: this.alignNavigation.bind(this),
			replaceRouteState: this.replaceRouteState.bind(this),
			pushRouteState: this.pushRouteState.bind(this)
		});

		this.activeTopicList = record;

		return topicList.restoreState(this.getRouteState());
	},

	updateForum: function () {
		var topicList = this.down('forums-forum-topic-list-view');

		if (!topicList) {
			return Promise.resolve();
		}

		return topicList.restoreState(this.getRouteState());
	}
});
