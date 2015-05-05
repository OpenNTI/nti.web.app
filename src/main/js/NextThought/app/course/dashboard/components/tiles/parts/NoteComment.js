Ext.define('NextThought.app.course.dashboard.components.tiles.parts.NoteComment', {
	extend: 'NextThought.app.course.dashboard.components.tiles.parts.PostComment',
	alias: 'widget.dashboard-note-comment',

	handleNavigation: function() {
		var cid = this.record.get('ContainerId');

		this.fireEvent('navigation-selected', cid, this.record, null, this.course);
	},


	fillInComments: function() {
		var comments = this.record.getReplyCount();

		if (comments === 0) {
			this.commentsEl.destroy();
		} else {
			this.commentsEl.update(Ext.util.Format.plural(comments, 'Comment'));
		}
	}
});
