Ext.define('NextThought.app.course.dashboard.components.tiles.parts.TopicComment', {
	extend: 'NextThought.app.course.dashboard.components.tiles.parts.PostComment',
	alias: 'widget.dashboard-topic-comment-part',

	isDeleted: function() {
		return this.record.get('Deleted');
	},


	handleNavigation: function() {
		this.fireEvent('goto-forum-item', this.record, this.course);
	},

	fillInComments: function() {
		var comments = this.record.get('ReferencedByCount');

		if (comments === 0) {
			this.commentsEl.destroy();
		} else {
			this.commentsEl.update(Ext.util.Format.plural(comments, 'Comment'));
		}
	}
});
