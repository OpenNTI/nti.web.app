const Ext = require('@nti/extjs');
const WindowsActions = require('internal/legacy/app/windows/Actions');

require('./PostComment');

module.exports = exports = Ext.define(
	'NextThought.app.course.dashboard.components.tiles.parts.NoteComment',
	{
		extend: 'NextThought.app.course.dashboard.components.tiles.parts.PostComment',
		alias: 'widget.dashboard-note-comment',

		initComponent: function () {
			this.callParent(arguments);
			this.WindowActions = WindowsActions.create();
		},

		handleNavigation: function () {
			this.WindowActions.pushWindow(
				this.record,
				null,
				null,
				{ afterClose: this.onWindowClose.bind(this) },
				{ course: this.course }
			);
		},

		onWindowClose: function () {
			this.removeAll(true);
			this.updateBody(); // Safe guard for now
			this.showComments();
		},

		fillInComments: function () {
			var comments = this.record.getReplyCount();

			if (comments === 0) {
				this.commentsEl.destroy();
			} else {
				this.commentsEl.update(
					Ext.util.Format.plural(comments, 'Comment')
				);
			}
		},
	}
);
