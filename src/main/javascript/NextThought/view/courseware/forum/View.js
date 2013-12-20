Ext.define('NextThought.view.courseware.forum.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-forum',
	requires: [
		'NextThought.layout.container.Stack',
		'NextThought.view.forums.Forum',
		'NextThought.view.ResourceNotFound'
	],


	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},

	cls: 'course-forum',

	layout: 'stack',

	listeners: {
		'activate': 'onActivate',
		'add': 'onViewPushed',
		'remove': 'onViewPopped',
		'beforedeactivate': 'handleDeactivate'
	},


	initComponent: function() {
		this.callParent(arguments);
		this.initCustomScrollOn('content');
	},


	handleDeactivate: function() {
		var c = this.peek(),
			p = this.el.up('.forum-in-view');

		if (c && c.unlockHeader) {
			c.unlockHeader();
		}

		if (p) {
			p.removeCls('forum-in-view');
		}
	},


	onActivate: function() {
		var c = this.peek();
		if (c && c.lockHeader && c.isVisible()) {
			c.lockHeader();//maybe this is already handled by this, but maybe we should check if we should lock?
		}

		if (this.store) {
			this.store.load();
		}
	},


	typePrefix: 'course-forum',


	onViewPushed: function(me, viewPushed) {
		var type;

		if (viewPushed.xtype === 'forums-topic') {
			type = 'topic';
		}else if (viewPushed.xtype === 'course-forum-topic-list') {
			type = 'forum';
		}

		if (type) {
			this.fireEvent('set-active-state', type, viewPushed.record.getId());
		}
	},


	onViewPopped: function(me, viewPopped) {
		var type;

		if (viewPopped.xtype === 'forums-topic') {
			type = 'topic';
		}else if (viewPopped.xtype === 'course-forum-topic-list') {
			type = 'forum';
		}

		if (type) {
			this.fireEvent('set-active-state', type, undefined);
		}
	},


	setBoard: function(board) {
		var id, store, me = this;

		function finish() {
			console.log('Pushing board for record', board, store);
			me.store = store;
			me.add({xtype: 'course-forum-board', record: board, store: store, loadMask: {
				margin: '100px 0 0 0',
				msg: 'Loading...'
			}});
			if (me.currentForum) {
				console.log('Restoring state', me.currentForum, me.currentTopic);
				me.restoreState(me.currentForum, me.currentTopic);
			}
		}

		this.hasBoard = !!board;
		if (!board) {
			console.log('Clearing board ', board);
			delete this.currentBoard;
			this.removeAll(true);
			return;
		}

		if (this.currentBoard === board) {
			return;
		}

		this.currentBoard = board;
		id = board.getContentsStoreId();
		store = Ext.getStore(id) || board.buildContentsStore();

		if ((board.get('Creator') || {}).isModel) {
			finish();
			return;
		}

		UserRepository.getUser(board.get('Creator'), function(u) {
			board.set('Creator', u);
			finish();
		});
	},


	navigateToForumObject: function(forum, topic, comment, cb) {
		if (Ext.isFunction(cb)) {
			this.hasTopicCallback = cb;
		}
		//if there is a valid state to restore there has to be a forum
		if (!forum) {
			Ext.callback(this.hasTopicCallback, null, [false]);
			delete this.hasTopicCallback;
			return;
		}
		//wait until the board is loaded
		var top = this.peek();
		if (!this.hasBoard || !top) {
			this.currentForum = forum;
			this.currentTopic = topic;
			this.currentComment = comment;
			return;
		}

		if (top.xtype === 'course-forum-board') {
			this.setForum(forum, topic, comment);
			return;
		}

		if (top.xtype === 'course-forum-topic-list') {
			if (top.record.getId() === forum) {
				this.setForum(undefined, topic, comment);
				return;
			}
		}

		if (top.xtype === 'forums-topic') {
			if (top.record.getId() === topic) {
				if (comment) {
					top.goToComment(comment);
				}
				Ext.callback(this.hasTopicCallback, null, [true, top]);
				delete this.hasTopicCallback;
				return;
			}
		}

		this.popView();
		this.navigateToForumObject.apply(this, arguments);
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


	pushViewSafely: function(c) {
		this.add(c);
	},


	setForum: function(forum, topic, comment) {
		var me = this, boardId = this.currentNtiid;

		forum = forum || (this.state && this.state.forum);
		topic = topic || (this.state && this.state.topic);
		comment = comment || (this.state && this.state.comment);

		if (!forum) {
			this.setTopic(topic, comment);
			return;
		}

		$AppConfig.service.getObject(forum, function(record) {
			delete me.currentForum;
			if (boardId !== me.currentNtiid) {
				console.warn('Dropping retrieved forum because board changed under us', boardId, me.boardId);
				return;
			}
			var storeId = record.getContentsStoreId(),
				store = Ext.getStore(storeId) || record.buildContentsStore(),
				cmp = Ext.widget('course-forum-topic-list', {
					record: record,
					store: store
				});
			me.pushViewSafely(cmp);
			me.setTopic(topic, comment);
		}, function() {
			console.error('Failed to load forum:', forum);
		});
	},


	setTopic: function(topic, comment) {
		var me = this, boardId = this.currentNtiid;
		if (!topic) {
			return;
		}

		topic = topic || (this.state && this.state.topic);
		comment = comment || (this.state && this.state.comment);

		$AppConfig.service.getObject(topic, function(record) {
			delete me.currentTopic;
			if (boardId !== me.currentNtiid) {
				console.warn('Dropping retrieved forum because board changed under us', boardId, me.boardId);
				return;
			}
			console.log(comment);
			var storeId = record.getContentsStoreId(),
				store = Ext.getStore(storeId) || record.buildContentsStore(),
				top = me.peek(),
				cmp = Ext.widget('forums-topic', {
					record: record,
					store: store
				});

			function setComment() {
				cmp.goToComment(comment);
			}
			if (top.xtype === 'course-forum-topic-list') {
				if (comment) {
					//Ext.defer(setComment, 10000, this);
					setComment();
				}
				me.pushViewSafely(cmp);
				Ext.callback(me.hasTopicCallback, null, [true, cmp]);
				delete me.hasTopicCallback;
			}else {
				me.topicMonitor = me.mon({
					destroyable: true,
					single: true,
					scope: me,
					'add': function(v, cmp) {
						if (cmp.xtype === 'course-forum-topic-list') {
							if (comment) {
								//Ext.defer(setComment, 10000, this);
								setComment();
							}
							Ext.destroy(me.topicMonitor);
							me.pushViewSafely(cmp);
						}
					}
				});
			}

		});
	},


	courseChanged: function(courseInstance) {
		var s = {content: {discussion: null}};

		//clear out all the views we've pushed
		this.removeAll(true);

		history.pushState(s); //history is accumulating at this point in the "transaction"

		this.setBoard(courseInstance && courseInstance.get('Discussions'));
	}
});


Ext.define('NextThought.view.courseware.forum.Board', {
	extend: 'NextThought.view.forums.Board',
	alias: 'widget.course-forum-board',

	requires: [
		'NextThought.view.forums.Forum'
	],

	selModel: {
		suppressPushState: true
	},

	scrollParentCls: '.course-forum',

	afterRender: function() {
		this.callParent(arguments);
		var header = this.el.down('.forum-forum-list');

		if (header) {
			header.removeCls('forum-forum-list');
			header.addCls('course-forum-list');
		}
	},

	onHeaderClick: function(e) {
		if (e.getTarget('.new-forum')) {
			e.stopEvent();
			this.fireEvent('new-forum', this);
			return false;
		}
	}
});



Ext.define('NextThought.view.courseware.forum.ForumList', {
	extend: 'NextThought.view.forums.Forum',
	alias: 'widget.course-forum-topic-list',

	requires: [
		'NextThought.view.forums.Topic'
	],

	selModel: {
		suppressPushState: true
	},

	scrollParentCls: '.course-forum',

	onHeaderClick: function(e) {
		if (e.getTarget('.path')) {
			this.fireEvent('pop-view', this);
		}
		else if (e.getTarget('.new-topic')) {
			this.fireEvent('new-topic', this);
		}
	}
});
