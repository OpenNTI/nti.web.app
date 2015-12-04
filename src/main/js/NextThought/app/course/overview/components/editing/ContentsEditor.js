Ext.define('NextThought.app.course.overview.components.editing.ContentsEditor', {
	extend: 'NextThought.app.course.overview.components.editing.OutlineEditor',
	alias: 'widget.overview-editing-outlineeditor',

	requires: [
		'NextThought.model.courses.overview.Lesson',
		'NextThought.app.course.overview.components.editing.contentlink.Editor'
	],


	statics: {
		getParents: function() {
			return [
				NextThought.model.courses.overview.Lesson.mimeType
			];
		},

		getTypeEditors: function() {
			var base = NextThought.app.course.overview.components.editing;

			return [
				base.contentlink.Editor
			];
		}
	},

	layout: 'none',
	items: []
}, function() {
	this.initRegistry();
});
