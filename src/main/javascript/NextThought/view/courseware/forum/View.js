Ext.define('NextThought.view.courseware.forum.View', {
	extend: 'NextThought.view.forums.Container',
	alias: 'widget.course-forum',

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},

	cls: 'course-forum scrollable',

	items: [{
		title: 'Forums',
		id: 'course-forums-container-root',
		xtype: 'forums-forum-view'
	}],

	listeners: {
		'beforedeactivate': 'handleDeactivate'
	},


	initComponent: function() {
		this.callParent(arguments);
		// this.initCustomScrollOn('.forum-nav', '.scroll-content');
	},


	handleDeactivate: function() {
		var p = this.el.up('.forum-in-view');

		if (p) {
			p.removeCls('forum-in-view');
		}
	},


	typePrefix: 'course-forum',


	setForumList: function(forumList) {
		var id, store, me = this;

		function finish() {
			me.showForumList(forumList);

			me.fireEvent('forum-list-loaded');
			//TODO: push state
		}

		this.hasBoard = !!forumList;

		if (!forumList) {
			delete this.currentBoard;
			this.removeAll(true);
			return;
		}

		if (this.currentForumList === forumList) {
			return;
		}

		this.currentForumList = forumList;

		if ((forumList.get('Creator') || {}).isModel) {
			finish();
			return;
		}

		UserRepository.getUser(forumList.get('Creator'), function(u) {
			forumList.set('Creator', u);
			finish();
		});
	},


	navigateToForumObject: function(forum, topic, comment, cb) {
		var me = this;

		if (Ext.isFunction(cb)) {
			me.hasTopicCallback = cb;
			console.error('tracking...', cb);
		}
		//if there is a valid state to restore there has to be a forum
		if (!forum) {
			try {
				Ext.callback(me.hasTopicCallback, null, [false]);
			} catch (e1) {
				console.warn(e1.stack || e1.message || e1);
			}
			delete me.hasTopicCallback;
			return;
		}

		//wait until the board is loaded
		if (!me.currentForumList) {
			me.on('forum-list-loaded', function() {
				me.setTopicList(forum, topic, comment, me.hasTopicCallback);
			});

			return;
		}

		me.setTopicList(forum, topic, comment, me.hasTopicCallback);
	},


	restoreState: function(forum, topic, comment, cb) {
		if (this.stateApplied) { return; }
		this.navigateToForumObject.apply(this, arguments);
	},


	applyState: function(forum, topic, comment, cb) {
		this.stateApplied = true;
		this.state = {
			forum: forum,
			topic: topic,
			comment: comment
		};
		this.navigateToForumObject.apply(this, arguments);
	},


	setTopicList: function(forum, topic, comment) {
		var me = this, boardId = this.currentNtiid;

		forum = forum || (this.state && this.state.forum);
		topic = topic || (this.state && this.state.topic);
		comment = comment || (this.state && this.state.comment);

		if (!forum) {
			console.error('Cant set forum with no forum');
			return;
		}

		Service.getObject(forum, function(record) {
			record.activeNTIID = topic;

			var cmp = me.showTopicList(record, me.currentForumList);

			Ext.callback(me.hasTopicCallback, null, [true, cmp]);
		}, function() {
			console.error('Failed to load forum:', forum);
		});
	},


	//override our parents implementation of this to keep from pushing a board list
	showBoardList: function() {},


	courseChanged: function(courseInstance) {
		var s = {content: {discussion: null}};
		//clear out all the views we've pushed
		this.removeAll(true);

		history.pushState(s); //history is accumulating at this point in the "transaction"

		this.setForumList(courseInstance && courseInstance.get('Discussions'));
	}
});
