Ext.define('NextThought.app.course.overview.components.editing.content.overviewgroup.ChildCreation', {
	extend: 'NextThought.app.course.overview.components.editing.creation.ChildCreation',
	alias: 'widget.overview-editing-overviewgroup-childcreation',

	requires: [
		'NextThought.model.courses.overview.Group',
		'NextThought.app.course.overview.components.editing.content.contentlink.Editor'
	],


	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.courses.overview.Group.mimeType
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
