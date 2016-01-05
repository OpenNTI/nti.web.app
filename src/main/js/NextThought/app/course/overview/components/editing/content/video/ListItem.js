Ext.define('NextThought.app.course.overview.components.editing.content.video.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-video-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.Video.mimeType;
		}
	},

	requires: [
		'NextThought.app.course.overview.components.parts.Video',
		'NextThought.model.Video'
	],


	getPreviewType: function(record) {
		return 'course-overview-video';
	}
});
