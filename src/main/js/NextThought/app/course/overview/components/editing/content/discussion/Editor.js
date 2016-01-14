Ext.define('NextThought.app.course.overview.components.editing.content.discussion.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-discussion',

	requires: ['NextThought.model.DiscussionRef'],

	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.DiscussionRef.mimeType
			];
		}
	},

	addFormCmp: function() {}
});
