Ext.define('NextThought.view.forums.Container', {
	extend: 'NextThought.view.Base',
	alias: 'widget.forums-container',

	requires: [
		'NextThought.view.forums.board.View',
		'NextThought.view.forums.forum.View',
		'NextThought.view.forums.topic.View'
	],

	cls: 'forums-view',
	title: 'NextThought: Discussions',
	layout: 'card',
	isForumContainer: true,
	extraTabBarCls: 'forums',

	items: [{
		title: 'Board',
		id: 'forums-container-root',
		xtype: 'forums-board-view'
	}],


	afterRender: function() {
		this.callParent(arguments);
		this.removeCls('make-white');
	},


	onAdd: function(item) {
		this.getLayout().setActiveItem(item);
	},


	getTabs: function() {
		if (!this.forumList) {
			return;
		}

		var board = this.forumList.get('title'),
			community = this.forumList.get('Creator');

		if (Ext.isString(community)) {
			console.error('Boards community isnt resolved yet');
			return;
		}

		community = community.toString();

		return [{
			label: community + '-' + board
		}];
	},


	onTabClicked: function() {
		delete this.forumList;
		this.showRoot();
		this.updateTabs();
	},


	updateTabs: function() {
		if (!this.isCourseForum) {
			this.callParent(arguments);
		}
	},


	getRoot: function() {
		return this.items.first();
	},


	showRoot: function() {
		this.getLayout().setActiveItem(0);
		Ext.destroy(this.items.getRange().slice(1));
	},

	/**
	* Check if view has already been added, if not add it with the record. If it has
	* and the records are different set the new record
	*
	* @param {String} xtype of the view
	* @param {Model} the record to set on the view
	* @return {View}
	**/
	setViewWithRecord: function(xtype, record) {
		var view = this.down(xtype);

		if (!view) {
			return this.add({ xtype: xtype, record: record});
		} else if (record && view.getCurrent && view.getCurrent() !== record) {
			view.setCurrent(record);
		}

		return view;
	},

	/**
	 * Loads the forums board view, and makes sure its on top
	 * @param  {NextThought.store.NTI} store Store of boards to load
	 */
	showBoardList: function(boardStore) {
		var boardView = this.setViewWithRecord('forums-board-view', boardStore);

		this.getLayout().setActiveItem(boardView);

		Ext.destroy(this.down('forums-forum-view forum-topic-view'));
	},

	//list of forums
	showForumList: function(forumList) {
		var me = this,
			forumView;

		me.forumList = forumList;

		forumView = me.setViewWithRecord('forums-forum-view', forumList);

		me.mon(forumView, {
			'active-record-changed': 'activeTopicListChanged',
			'pop-view': function() {
				if (!me.isCourseForum) {
					delete me.forumList;
					me.updateTabs();
					me.showBoardList();
				}
			}
		});

		me.getLayout().setActiveItem(forumView);

		Ext.destroy(this.down('forums-topic-view'));

		this.updateTabs();

		return forumView;
	},

	//list of topics
	showTopicList: function(topicList, forumList) {
		var topicView, me = this, forum;

		this.forumList = forumList || this.forumList;
		this.topicList = topicList;

		this.setViewWithRecord('forums-forum-view', forumList);
		topicView = this.setViewWithRecord('forums-topic-view', topicList);

		this.mon(topicView, 'active-record-changed', 'activeTopicChanged');
		this.mon(topicView, {
			single: true,
			//go back to the forum-list we were at
			'pop-view': function() {
				delete me.topicList.activeRecord;
				me.updateState();
				me.showForumList(me.forumList);
			},
			//a new record was added
			'new-record': function(record) {
				forum = me.down('forums-forum-view');

				if (forum) {
					forum.newRecordAdded(record);
				} else {
					console.error('No forum view to add the topic to.', record);
				}
			},
			'pop-to-root': function() {
				if (!me.isCourseForum) {
					delete me.forumList;
				}
				delete me.topicList;
				me.updateTabs();
				me.updateState();
				me.showRoot();
			}
		});

		this.updateTabs();

		this.getLayout().setActiveItem(topicView);

		return topicView;
	},

	/**
	 * Loads the correct forums and opens an editor with the topic
	 * @param  {NextThought.model.forums.Topic} topic   the topic to edit
	 * @param  {NextThought.model.forums.Forum} topicList   the topicList the topic belongs to
	 * @param  {NextThought.model.forums.Board} forumList   the forumList the topicList belongs to
	 * @param  {Function} closeCallback   what to do when the editor closes
	 */
	showTopicEditor: function(topic, topicList, forumList, closeCallback) {
		var topicView = this.showTopicList(topicList, forumList);
		topicView.showEditor(topic, topicList, closeCallback);
	},


	activeTopicListChanged: function(topicList) {
		this.topicList = topicList;
		this.updateState();
	},


	activeTopicChanged: function(topic) {
		//if the active topic is changed we have to have a topic list
		this.topicList.activeRecord = topic;
		this.updateState();
	},


	//only use this when a view is popping or changing the active record, otherwise the controller will take care of it
	updateState: function() {
		if (!this.isActive()) {
			return;
		}

		this.fireEvent('active-state-changed', this.forumList, this.topicList, this.topicList && this.topicList.activeRecord, this.title);
	}
});
