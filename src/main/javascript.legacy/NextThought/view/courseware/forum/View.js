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
		var silent = this.ownerCt.getLayout().getActiveItem() !== this;


		if (!forumList) {
			delete this.hasBoard;
			delete this.forumList;

			this.removeAll(true);
			this.fireEvent('hide-forum-tab');
		} else if (this.forumList === forumList) {
			return;
		} else if (this.isFromNavigatingToForum) {
			delete this.isFromNavigatingToForum;
		} else {
			this.fireEvent('maybe-show-forum-list', this, forumList, silent);
		}
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


	bundleChanged: function(bundle) {
		this.hasBoard = true;

		this.onceLoaded = new Deferred();//IDK... is this used?

		return ((bundle && bundle.getForumList()) || Promise.reject('No Board'))
			.then(this.setForumList.bind(this))
			.fail(this.setForumList.bind(this, false));
	}
});
