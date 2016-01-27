Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.EditorGroup',
	alias: 'widget.overview-editing-contentlink-editor',

	requires: [
		'NextThought.app.course.overview.components.editing.content.contentlink.types.Doc',
		'NextThought.app.course.overview.components.editing.content.contentlink.types.Reading',
		'NextThought.app.course.overview.components.editing.content.contentlink.types.URL'
	],

	statics: {
		getSubEditors: function() {
			var base = NextThought.app.course.overview.components.editing.content.contentlink.types;

			return [
				base.Doc,
				// base.EmbeddedPDF,
				base.Reading,
				base.URL
			];
		}
	}

});
