Ext.define('NextThought.app.course.overview.components.editing.content.lessonoverview.ChildCreation', {
	extend: 'NextThought.app.course.overview.components.editing.creation.ChildCreation',
	alias: 'widget.overview-editing-lessonoverview-childcreation',

	requires: [
		'NextThought.model.courses.overview.Lesson',
		'NextThought.app.course.overview.components.editing.content.overviewgroup.Editor'
	],

	title: 'Content Types',
	saveText: 'Add to Lesson',

	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.courses.overview.Lesson.mimeType
			];
		},

		getEditors: function() {
			var base = NextThought.app.course.overview.components.editing.content;

			return [
				base.overviewgroup.Editor
			];
		}
	},


	setUpTypeList: function() {
		this.callParent(arguments);
	}
});
