Ext.define('NextThought.app.forums.components.forum.Forum', {
	extend: 'Ext.container.Container',
	alias: 'widget.forums-forum-body',

	layout: 'none',

	requires: ['NextThought.app.forums.components.forum.parts.*'],

	cls: 'topic-list-body forum-body',

	storeCfg: {
		pageSize: 10
	},


	setForum: function(record) {
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
		header = this.add({xtype: 'forums-forum-header', record: record, store: store});
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


		this.activeTopic = record;

		return topicList.restoreState(this.getRouteState());
	},


	updateForum: function() {
		var topicList = this.down('forums-forum-topic-list-view');

		return topicList.restoreState(this.getRouteState());
	}
});
