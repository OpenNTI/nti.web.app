Ext.define('NextThought.view.forums.topic.View', {
	extend: 'NextThought.view.forums.hierarchy.View',
	alias: 'widget.forums-topic-view',

	cls: 'topic-view',

	noScrollBuffer: false,

	requires: [
		'NextThought.view.forums.topic.Body',
		'NextThought.view.forums.topic.Navigation'
	],

	navigation: { xtype: 'forums-topic-nav' },
	body: { xtype: 'forums-topic-body' },

	storeCfg: {
		pageSize: 10
	},


	setCurrentBody: function() {
		this.callParent(arguments);

		this.initCustomScrollOn('content', '.topic-container');
	},


	showEditor: function(topic, topicList, closeCallback) {
		var store = topicList.buildContentsStore('', this.storeCfg);

		this.currentRecord = topicList;
		this.store = store;

		this.store.load();

		this.navigation.setCurrent(topicList, store);
		this.body.showEditor(topic, topicList, closeCallback);
	}
});
