const Ext = require('@nti/extjs');
const { Forums } = require('@nti/web-discussions');

const WindowsActions = require('legacy/app/windows/Actions');
const WindowsStateStore = require('legacy/app/windows/StateStore');

const ForumsActions = require('../../Actions');

require('legacy/app/windows/components/Header');
require('legacy/app/windows/components/Loading');
require('legacy/app/windows/Actions');
require('legacy/common/form/Form');

module.exports = exports = Ext.define('NextThought.app.forums.components.forum.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.forum-window',
	layout: 'none',
	cls: 'forum-window',

	initComponent () {
		this.callParent(arguments);

		const { state: { board, onForumAdd }} = this.initialConfig;
		this.board = board;
		this.onForumAdd = onForumAdd;
		this.WindowActions = WindowsActions.create();
		this.ForumsActions = ForumsActions.create();
		this.forumCreate = this.add({
			xtype: 'react',
			component: Forums.ForumCreate,
			onBeforeDismiss: this.doClose,
			onSubmit: this.onSubmit.bind(this)
		});
	},

	async onSubmit (newForum) {
		const forum = await this.ForumsActions.createForum(newForum, this.board, this.onForumAdd);
		this.onForumAdd(forum);
		this.doClose();
	},

	onClose () {
		this.doClose();
	}
}, function () {
	WindowsStateStore.register('new-forum', this);
});
