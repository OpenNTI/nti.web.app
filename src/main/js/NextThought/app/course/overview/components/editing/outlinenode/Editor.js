Ext.define('NextThought.app.course.overview.components.editing.outlinenode.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.Editor',
	alias: 'widget.overview-editing-outlinenode-editor',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineNode'
	],

	FORM_SCHEMA: [
		{type: 'hidden', name: 'MimeType'},
		{type: 'text', name: 'title', displayName: 'Title'}
	],

	statics: {
		getTypes: function() {
			return {
				mimeType: NextThought.model.courses.navigation.CourseOutlineNode.mimeType,
				types: [
					{
						title: 'Unit',
						iconCls: 'unit',
						type: 'unit',
						description: 'Unit is good for...'	
					}
				]
			}
		}
	},


	getDefaultValues: function() {
		return {
			MimeType: NextThought.model.courses.navigation.CourseOutlineNode.mimeType,
			title: (this.record && this.record.getTitle()) || ''
		};
	}
});
