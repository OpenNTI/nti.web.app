Ext.define('NextThought.view.courseware.forum.View', {
	extend: 'NextThought.view.forums.Container',
	alias: 'widget.course-forum',

	isCourseForum: true,

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


	setForumList: function(forumList, topic, commnet) {
		var id, store, me = this;

		function finish() {
			if (!me.isActive()) {
				me.on('activate', finish, me, {single: true});
			}

			me.fireEvent('maybe-show-forum-list', me, forumList);
		}


		if (!forumList) {
			delete this.currentForumList;
			this.removeAll(true);
			return;
		}

		if (this.currentForumList === forumList) {
			return;
		}

		this.currentForumList = forumList;
		this.hasBoard = true;

		if ((forumList.get('Creator') || {}).isModel) {
			finish();
			return;
		}

		UserRepository.getUser(forumList.get('Creator'), function(u) {
			forumList.set('Creator', u);
			finish();
		});
	},


	restoreState: function(forum, topic, comment) {
		if (!forum) { return; }
		forum.comment = comment;
		me.fireEvent('show-topic-list', forum, topic);
	},


	//override our parents implementation of this to keep from pushing a board list
	showBoardList: function() {},


	courseChanged: function(courseInstance) {
		this.setForumList(courseInstance && courseInstance.get('Discussions'));
	}
});
