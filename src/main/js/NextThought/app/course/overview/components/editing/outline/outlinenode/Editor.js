Ext.define('NextThought.app.course.overview.components.editing.outline.outlinenode.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.Editor',
	alias: 'widget.overview-editing-outlinenode-editor',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineNode'
	],


	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.courses.navigation.CourseOutlineNode.mimeType
			];
		},


		getTypes: function() {
			return [
				{
					title: 'Unit',
					iconCls: 'unit',
					type: 'unit',
					description: 'A unit is good for...',
					editor: this
				}
			];
		}
	},


	FORM_SCHEMA: [
		{type: 'hidden', name: 'MimeType'},
		{type: 'text', name: 'title', displayName: 'Title'}
	],


	getDefaultValues: function() {
		return {
			MimeType: NextThought.model.courses.navigation.CourseOutlineNode.mimeType,
			title: (this.record && this.record.getTitle()) || ''
		};
	}
});
