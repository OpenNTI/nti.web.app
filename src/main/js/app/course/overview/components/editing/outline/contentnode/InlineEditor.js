Ext.define('NextThought.app.course.overview.components.editing.outline.contentnode.InlineEditor', {
	extend: 'NextThought.app.course.overview.components.editing.outline.InlineEditor',
	alias: 'widget.overview-editing-contentnode-inline-editor',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineContentNode'
	],

	statics: {
		creationText: 'Add Lesson',

		getTypes: function() {
			return {
				mimeType: NextThought.model.courses.navigation.CourseOutlineContentNode.mimeType,
				types: []
			};
		}
	}
});
