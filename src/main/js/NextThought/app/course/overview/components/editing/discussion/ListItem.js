Ext.define('NextThought.app.course.overview.components.editing.discussion.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.ListItem',
	alias: 'widget.overview-editing-discussion-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.DiscussionRef.mimeType;
		}
	},

	requires: [
		'NextThought.app.course.overview.components.parts.Discussion',
		'NextThought.model.DiscussionRef'
	],


	getPreviewType: function() {
		return 'course-overview-discussion';
	}
});
