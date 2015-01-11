Ext.define('NextThought.view.courseware.dashboard.tiles.parts.TopicComment', {
	extend: 'NextThought.view.courseware.dashboard.tiles.parts.PostComment',
	alias: 'widget.dashboard-topic-comment-part',

	fillInComments: function() {
		var comments = this.record.get('ReferencedByCount');

		if (comments === 0) {
			this.commentsEl.destroy();
		} else {
			this.commentsEl.update(Ext.util.Format.plural(comments, 'Comment'));
		}
	}
});
