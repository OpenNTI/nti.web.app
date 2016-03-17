export default Ext.define('NextThought.app.course.overview.components.editing.content.discussion.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-discussion-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.DiscussionRef.mimeType;
		}
	},

	cls: 'overview-editing-listitem discussion',

	requires: [
		'NextThought.app.course.overview.components.parts.Discussion',
		'NextThought.model.DiscussionRef'
	],


	dropPlaceholderStyles: {
		side: 'left'
	},


	getPreviewType: function() {
		return 'course-overview-discussion';
	}
});
