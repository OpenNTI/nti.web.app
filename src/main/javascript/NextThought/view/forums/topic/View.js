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

		this.callParent(arguments);
	},


	setCurrentBody: function() {
		var record = this.callParent(arguments),
			me = this,
			container = me.up('[currentBundle]');

		function stopTimer() {
			if (me.currentAnalyticId && me.hasCurrentTimer) {
				delete me.hasCurrentTimer;
				AnalyticsUtil.stopResourceTimer(me.currentAnalyticId, 'discussion-viewed');
			}
		}

		function startTimer() {
			if (!me.hasCurrentTimer) {
				me.hasCurrentTimer = true;

				AnalyticsUtil.getResourceTimer(me.currentAnalyticId, {
					type: 'discussion-viewed',
					course: container && container.currentBundle && container.currentBundle.getId(),
					topic_id: me.currentAnalyticId
				});
			}
		}

		if (record.getId() !== me.currentAnalyticId) {
			stopTimer();
			me.currentAnalyticId = record.getId();
			startTimer();
		}

		if (!me.visibilityMonitors) {
			me.visibilityMonitors = this.on({
				'destroy': function() {
					Ext.destroy(me.visibilityMonitors);
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
		}

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
