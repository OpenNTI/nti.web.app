Ext.define('NextThought.app.course.overview.components.editing.timeline.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.ListItem',
	alias: 'widget.overview-editing-timeline-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.Timeline.mimeType;
		}
	},

	requires: [
		'NextThought.app.course.overview.components.parts.Timeline',
		'NextThought.model.Timeline'
	],


	getPreviewType: function() {
		return 'course-overview-ntitimeline';
	}
});
