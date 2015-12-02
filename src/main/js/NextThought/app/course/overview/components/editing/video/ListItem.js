Ext.define('NextThought.app.course.overview.components.editing.video.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.ListItem',
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
