Ext.define('NextThought.app.course.overview.components.editing.content.poll.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-poll-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.PollRef.mimeType;
		}
	},

	requires: [
		'NextThought.app.course.overview.components.parts.Poll',
		'NextThought.model.PollRef'
	],


	getPreviewType: function() {
		// return 'widget.course-overview-pollref';//comment this out for now since we don't support it yet
	}
});
