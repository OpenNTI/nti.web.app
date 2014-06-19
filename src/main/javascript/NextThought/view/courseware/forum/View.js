Ext.define('NextThought.view.courseware.forum.View', {
	extend: 'NextThought.view.forums.Container',
	alias: 'widget.course-forum',

	isCourseForum: true,
	typePrefix: 'course-forum',

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


	handleDeactivate: function() {
		var p = this.el.up('.forum-in-view');
		if (p) {
			p.removeCls('forum-in-view');
		}
	},


	setForumList: function(forumList, topic, commnet) {
		var me = this;

		function finish() {
			//we already have a board loaded, so don't overwrite it
			if (me.forumList === forumList) { return; }
			var silent = me.ownerCt.getLayout().getActiveItem() !== me;

			if (!me.isActive()) {
				me.on('activate', finish, me, {single: true});
				return;
			}

			me.fireEvent('maybe-show-forum-list', me, forumList, silent);
		}


		if (!forumList) {
			delete this.hasBoard;
			delete this.currentForumList;
			this.removeAll(true);
			this.fireEvent('hide-forum-tab');
			return;
		}

		if (this.currentForumList === forumList) {
			return;
		}

		this.currentForumList = forumList;

		if ((forumList.get('Creator') || {}).isModel) {
			return finish();
		}

		UserRepository.getUser(forumList.get('Creator'))
				.then(function(u) {	forumList.set('Creator', u); })
				.then(finish);
	},


	restoreState: function(forum, topic, comment) {
		if (!forum) { return; }
		forum.comment = comment;
		this.fireEvent('show-topic-list', forum, topic);
	},


	//override our parents implementation of this to keep from pushing a board list
	showBoardList: function() {},


	activeTopicListChanged: function() {
		this.callParent(arguments);
		if (this.onceLoaded) {
			this.onceLoaded.fulfill();
		}
	},


	courseChanged: function(courseInstance) {
		this.hasBoard = true;

		this.onceLoaded = new Deferred();

		this.setForumList(courseInstance && courseInstance.get('Discussions'));
	}
});
