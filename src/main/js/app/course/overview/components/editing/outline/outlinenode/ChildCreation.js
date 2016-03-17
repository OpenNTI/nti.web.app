export default Ext.define('NextThought.app.course.overview.components.editing.outline.outlinenode.ChildCreation', {
	extend: 'NextThought.app.course.overview.components.editing.creation.ChildCreation',
	alias: 'widget.overview-editing-outlinenode-childcreation',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineNode',
		'NextThought.app.course.overview.components.editing.outline.outlinenode.Editor'
	],

	title: 'Lesson',
	saveText: 'Add to Unit',

	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.courses.navigation.CourseOutlineNode.mimeType
			];
		},

		getEditors: function() {
			var base = NextThought.app.course.overview.components.editing.outline;

			return [
				base.contentnode.Editor
			];
		}
	},

	setUpTypeList: function() {
		this.callParent(arguments);
	}

});
