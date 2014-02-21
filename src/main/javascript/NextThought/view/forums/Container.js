Ext.define('NextThought.view.forums.Container', {
	extend: 'NextThought.view.Base',
	alias: 'widget.forums-container',

	require: [
		'NextThought.view.forums.board.View'
	],

	cls: 'forums-view',
	title: 'NextThought: Discussions',
	layout: 'card',
	isForumContainer: true,

	items: [{
		title: 'Board',
		id: 'forums-container-root',
		xtype: 'forums-board-view'
	}],


	restore: function(state) {
		var p = PromiseFactory.make();

		this.fireEvent('restore-forum-state', state, p);

		return p;
	},


	afterRender: function() {
		this.callParent(arguments);
		this.removeCls('make-white');
	},


	onAdd: function(item) {
		this.getLayout().setActiveItem(item);
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
		var forumView;

		this.forumList = forumList;

		forumView = this.setViewWithRecord('forums-forum-view', forumList);

		this.getLayout().setActiveItem(forumView);

		Ext.destroy(this.down('forums-topic-view'));

		return forumView;
	},

	//list of topics
	showTopicList: function(topicList, forumList) {
		var topicView, me = this, forum;

		this.forumList = forumList || this.forumList;
		this.topicList = topicList;

		this.setViewWithRecord('forums-forum-view', forumList);
		topicView = this.setViewWithRecord('forums-topic-view', topicList);

		this.mon(topicView, {
			single: true,
			'pop-view': function() {
				me.updateState();
				me.showForumList();
			},
			'new-record': function(record) {
				forum = me.down('forums-forum-view');

				if (forum) {
					forum.newRecordAdded(record);
				} else {
					console.error('No forum view to add the topic to.', record);
				}
			}
		});

		this.getLayout().setActiveItem(topicView);

		return topicView;
	},


	showTopicEditor: function(topic, topicList, forumList, closeCallback) {
		var topicView = this.showTopicList(null, forumList);

		topicView.showEditor(topic, topicList, closeCallback);
	},


	//only use this when a view is popping, otherwise the controller will take care of it
	updateState: function() {
		if (!this.forumList) {
			console.error('No forum list to set the state for...');
			return;
		}

		var comm = this.forumList.get('Creator'), s,
			forum = this.topicList && this.topicList.get('ID');

		comm = comm.isModel ? comm.get('ID') : comm;

		s = {
			board: {
				community: comm,
				isUser: true
			},
			forum: forum,
			topic: undefined //since this is only used on pop topic will neve be set
		};

		history.pushState({active: 'forums', forums: s});
	}
});
