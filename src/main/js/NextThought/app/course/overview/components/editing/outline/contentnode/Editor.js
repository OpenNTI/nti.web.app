Ext.define('NextThought.app.course.overview.components.editing.outline.contentnode.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.outline.calendarnode.Editor',
	alias: 'widget.overview-editing-contentnode-editor',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineNode'
	],


	statics: {
		getTypes: function() {
			return {
				mimeType: NextThought.model.courses.navigation.CourseOutlineContentNode.mimeType,
				types: [
					{
						title: 'Lesson',
						iconCls: 'lesson',
						type: 'lesson',
						desciption: 'A Lesson is good for...'
					}
				]
			};
		}
	},


	getDefaultValues: function() {
		return {
			MimeType: NextThought.model.courses.navigation.CourseOutlineContentNode.mimeType,
			title: (this.record && this.record.getTitle()) || '',
			AvailableBeginning: this.record && this.record.get('AvailableBeginning'),
			AvailableEnding: this.record && this.record.get('AvailableEnding')
		};
	}
});
