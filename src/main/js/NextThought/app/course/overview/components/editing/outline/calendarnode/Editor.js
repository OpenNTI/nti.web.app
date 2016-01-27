Ext.define('NextThought.app.course.overview.components.editing.outline.calendarnode.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.outline.outlinenode.Editor',
	alias: 'widget.overview-editing-calendarnode-editor',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineCalendarNode'
	],


	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.courses.navigation.CourseOutlineCalendarNode.mimeType
			];
		},

		getTypes: function() {
			return [];
		}
	}
});
