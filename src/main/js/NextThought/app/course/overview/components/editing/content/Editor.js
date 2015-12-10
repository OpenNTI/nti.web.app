Ext.define('NextThought.app.course.overview.components.editing.content.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.outline.Editor',
	alias: 'widget.overview-editing-content-editor',

	requires: [
		'NextThought.model.courses.overview.Lesson',
		'NextThought.model.courses.overview.Group',
		'NextThought.app.course.overview.components.editing.content.contentlink.Editor'
	],

	statics: {

		getParents: function() {
			return [
				NextThought.model.courses.overview.Lesson.mimeType,
				NextThought.model.courses.overview.Group.mimeType
			];
		},


		getTypeEditors: function() {
			var base = NextThought.app.course.overview.components.editing.content;

			return [
				base.contentlink.Editor
			];
		}
	}
}, function() {
	this.initRegistry();
});
