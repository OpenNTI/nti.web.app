Ext.define('NextThought.view.courseware.dashboard.tiles.parts.NoteComment', {
	extend: 'NextThought.view.courseware.dashboard.tiles.parts.PostComment',
	alias: 'widget.dashboard-note-comment',

	fillInComments: function() {
		var comments = this.record.getReplyCount();

		if (comments === 0) {
			this.commentsEl.destroy();
		} else {
			this.commentsEl.update(Ext.util.Format.plural(comments, 'Comment'));
		}
	}
});
