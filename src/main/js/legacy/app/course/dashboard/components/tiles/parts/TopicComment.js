var Ext = require('extjs');
var PartsPostComment = require('./PostComment');


module.exports = exports = Ext.define('NextThought.app.course.dashboard.components.tiles.parts.TopicComment', {
	extend: 'NextThought.app.course.dashboard.components.tiles.parts.PostComment',
	alias: 'widget.dashboard-topic-comment-part',

	isDeleted: function () {
		return this.record.get('Deleted');
	},


	initComponent: function () {
		this.callParent(arguments);
		this.WindowActions = NextThought.app.windows.Actions.create();
	},


	handleNavigation: function () {
		this.WindowActions.pushWindow(this.record, null, null, {afterClose: this.onWindowClose.bind(this)}, {course: this.course});
	},


	onWindowClose: function () {
		this.removeAll(true);
		this.updateBody(); // Safe guard for now
		this.showComments();
	},


	fillInComments: function () {
		var comments = this.record.get('ReferencedByCount');

		if (comments === 0) {
			this.commentsEl.destroy();
		} else {
			this.commentsEl.update(Ext.util.Format.plural(comments, 'Comment'));
		}
	}
});
