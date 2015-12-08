Ext.define('NextThought.app.course.overview.components.editing.outline.calendarnode.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.Editor',
	alias: 'widget.overview-editing-calendarnode-editor',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineCalendarNode'
	],


	statics: {
		getTypes: function() {
			return {
				mimeType: NextThought.model.courses.navigation.CourseOutlineCalendarNode.mimeType
			};
		}
	},

	FORM_SCHEMA: [
		{type: 'hidden', name: 'MimeType'},
		{type: 'text', name: 'title', displayName: 'Title'},
		{type: 'date', name: 'AvailableBeginning', displayName: 'Available Beginning'},
		{type: 'date', name: 'AvailableEnding', displayName: 'Available Ending'}
	],


	getDefaultValues: function() {
		return {
			MimeType: NextThought.model.courses.navigation.CourseOutlineCalendarNode.mimeType,
			title: (this.record && this.record.getTitle()) || '',
			AvailableBeginning: this.record && this.record.get('AvailableBeginning'),
			AvailableEnding: this.record && this.record.get('AvailableEnding')
		};
	}
});
