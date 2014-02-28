Ext.define('NextThought.view.forums.topic.View', {
	extend: 'NextThought.view.forums.hierarchy.View',
	alias: 'widget.forums-topic-view',

	cls: 'topic-view',

	noScrollBuffer: false,

	requires: [
		'NextThought.view.forums.topic.Body',
		'NextThought.view.forums.topic.Navigation'
	],

	navigation: { xtype: 'forums-topic-nav', region: 'east', margin: 0, override: true},
	body: { xtype: 'forums-topic-body' },

	storeCfg: {
		pageSize: 10,
		buffered: true,
		sorters: []
	},


	setCurrentBody: function() {
		this.callParent(arguments);

		this.initCustomScrollOn('content', '.topic-container', {secondaryViewEl: '.topic-nav', altClass: 'forum-in-view', noBuffer: true});
	},


	showEditor: function(topic, topicList, closeCallback) {
		var store = topicList.buildContentsStore('', this.storeCfg);

		this.currentRecord = topicList;
		this.store = store;

		this.store.load();

		this.navigation.setCurrent(topicList, store);
		this.body.showEditor(topic, topicList, closeCallback);
	},

	//used in the saved comment handler
	getTopic: function() {
		return this.body.currentRecord;
	},


	recordDeleted: function(activeIndex) {
		var active = this.store.getAt(activeIndex);

		this.currentRecord.activeRecord = active;

		this.setCurrent(this.currentRecord);
	},


	newRecordAdded: function(record) {
		//this.store.proxy.extraParams = Ext.apply(this.store.proxy.extraParams || {}, { batchAround: record.getId()});

		this.store.load();
		this.setCurrentBody(record);
	},


	realignSidebar: function() {
		var viewportHeight = Ext.Element.getViewHeight(),
			top = this.navigation.getY();

		this.navigation.updateGridHeight(viewportHeight - top);
	}
});
