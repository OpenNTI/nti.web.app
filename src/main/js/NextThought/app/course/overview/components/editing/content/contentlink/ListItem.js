Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-contentlink-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.RelatedWork.mimeType;
		}
	},

	requires: [
		'NextThought.app.course.overview.components.parts.ContentLink',
		'NextThought.model.RelatedWork'
	],

	canEdit: true,


	getPreviewType: function(record) {
		return 'course-overview-content';
	}
});
