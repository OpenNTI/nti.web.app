Ext.define('NextThought.app.course.overview.components.editing.videoroll.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.ListItem',
	alias: 'widget.overview-editing-videoroll-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.VideoRoll.mimeType;
		}
	},

	requires: [
		'NextThought.app.course.overview.components.parts.VideoRoll',
		'NextThought.model.VideoRoll'
	],


	getPreviewType: function(record) {
		return 'course-overview-videoroll';
	}
});
