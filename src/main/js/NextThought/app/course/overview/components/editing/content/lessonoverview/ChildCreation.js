Ext.define('NextThought.app.course.overview.components.editing.content.lessonoverview.ChildCreation', {
	extend: 'NextThought.app.course.overview.components.editing.creation.ChildCreation',

	requires: [
		'NextThought.model.courses.overview.Lesson',
		'NextThought.app.course.overview.components.editing.content.contentlink.Editor'
	],


	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.courses.overview.Lesson.mimeType
			];
		},

		getEditors: function() {
			var base = NextThought.app.course.overview.components.editing.content;

			return [
				base.contentlink.Editor
			];
		}
	}
});
