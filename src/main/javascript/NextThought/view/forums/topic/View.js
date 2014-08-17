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
		pageSize: 50,
		buffered: true,
		sorters: []
	},

	model: 'NextThought.model.forums.CommunityHeadlineTopic',

	setExtraParams: function(record) {
		var store = Ext.getStore(record.getContentsStoreId('', 'topic-list-view'));

		this.storeExtraParams = store && store.getProxy().extraParams;
	},

	setCurrent: function(record) {
		this.setExtraParams(record);

		var me = this,
			container = me.up('[currentBundle]'),
			id = record.getId();

		function startTimer() {
			if (container) {
				AnalyticsUtil.getResourceTimer(id, {
					type: 'discussion-viewed',
					course: container.currentBundle.getId(),
					topic_id: id
				});
			}
		}

		function stopTimer() {
			AnalyticsUtil.stopResourceTimer(id, 'discussion-viewed');
		}

		Ext.destroy(me.visibilityMonitors);

		me.visibilityMonitors = this.on({
			'destroy': function() {
				stopTimer();
			},
			'visibility-changed': function(visible) {
				//start the time when we become visible, stop it when we hide
				if (visible) {
					startTimer();
				} else {
					stopTimer();
				}
			}
		}, me, {destroyable: true});

		startTimer();

		me.callParent(arguments);
	},


	setCurrentBody: function() {
		this.callParent(arguments);

		this.realignSidebar();

		if (this.up('[isCourseForum]')) {
			this.initCustomScrollOn('content', '.topic-container', {secondaryViewEl: '.topic-nav', altClass: 'forum-in-view'});
		}
	},


	showEditor: function(topic, topicList, closeCallback) {
		this.setExtraParams(topicList);
		var store = topicList.buildContentsStore('', this.storeCfg, this.storeExtraParams),
			pageSource = this.getPageSource(null);

		if (this.body.showEditor(topic, topicList, pageSource, closeCallback)) {
			this.currentRecord = topicList;
			this.store = store;

			this.store.load();

			this.navigation.setCurrent(topicList, store);
			this.realignSidebar();
		}
	},

	//used in the saved comment handler
	getTopic: function() {
		return this.body.currentRecord;
	},


	recordDeleted: function(activeIndex) {
		var active = Ext.isNumber(activeIndex) ? this.store.getAt(activeIndex) : activeIndex;

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
	},


	addIncomingComment: function(comment) {
		this.body.addIncomingComment(comment);
	},


	showSearchHit: function(hit, frag) {
		this.body.showSearchHit(hit, frag);
	}
});
