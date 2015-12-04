Ext.define('NextThought.app.course.overview.components.editing.calendarnode.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.Editor',
	alias: 'widget.overview-editing-contentnode-editor',

	requires: [
		'NextThought.app.course.overview.components.editing.OutlineEditor',
		'NextThought.model.courses.navigation.CourseOutlineCalendarNode'
	],

	FORM_SCHEMA: [
		{type: 'hidden', name: 'MimeType'},
		{type: 'text', name: 'title', displayName: 'Title'}
	],


	getDefaultValues: function() {
		return {
			MimeType: NextThought.model.courses.navigation.CourseOutlineCalendarNode.mimeType,
			title: (this.record && this.record.getTitle()) || ''
		};
	}
});
