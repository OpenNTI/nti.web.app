Ext.define('NextThought.view.forums.forum.Body', {
	extend: 'NextThought.view.forums.hierarchy.Body',
	alias: 'widget.forums-forum-body',

	cls: 'topic-list-body forum-body',

	requires: [
		'NextThought.view.forums.forum.parts.*'
	],


	storeCfg: {
		pageSize: 50
	},


	setCurrent: function(record) {
		if (!record) { return; }

		var topicList = this.down('forums-forum-topic-list-view'),
			filterBar = this.down('forums-forum-filterbar'),
			header = this.down('forums-forum-header'),
			store = record.buildContentsStore('topic-list-view', this.storeCfg);

		if (topicList && topicList.record === record) {
			return;
		}

		this.store = store;

		Ext.destroy(topicList, filterBar, header);

		filterBar = this.add({xtype: 'forums-forum-filterbar'});
		header = this.add({xtype: 'forums-forum-header', record: record, store: store});
		topicList = this.add({xtype: 'forums-forum-topic-list-view', record: record, store: store, filterBar: filterBar, header: header});

		return true;
	}
});
