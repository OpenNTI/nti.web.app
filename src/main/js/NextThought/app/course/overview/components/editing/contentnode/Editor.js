Ext.define('NextThought.app.course.overview.components.editing.contentnode.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.Editor',
	alias: 'widget.overview-editing-contentnode-editor',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineContentNode'
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
						description: 'Lesson is good for...'	
					}
				]
			}
		}
	},

	FORM_SCHEMA: [
		{type: 'text', name: 'title', displayName: 'Title'},
		{type: 'date', name: 'AvailableBeginning', displayName: 'Available Beginning'},
		{type: 'date', name: 'AvailableEnding', displayName: 'Available Ending'},
		{type: 'hidden', name: 'MimeType'}
	],


	getDefaultValues: function() {
		return {
			MimeType: NextThought.model.courses.navigation.CourseOutlineContentNode.mimeType,
			title: (this.record && this.record.getTitle()) || '',
			AvailableBeginning: this.record && this.record.get('AvailableBeginning'),
			AvailableEnding: this.record && this.record.get('AvailableEnding')
		};
	}
});
