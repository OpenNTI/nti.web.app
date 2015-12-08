Ext.define('NextThought.app.course.overview.components.editing.outline.calendarnode.Index', {
	extend: 'NextThought.app.course.overview.components.editing.outline.outlinenode.Index',
	alias: 'widget.overview-editing.calendarnode',


	statics: {
		getSupported: function() {
			return NextThought.model.courses.navigation.CourseOutlineCalendarNode.mimeType;
		}
	},


	requires: [
		'NextThought.model.courses.navigation.CourseOutlineCalendarNode',
		'NextThought.app.course.overview.components.editing.outline.calendarnode.Preview'
	],


	getPreviewConfig: function(record, bundle) {
		return {
			xtype: 'overview-editing-outline-calendarnode-preview',
			record: record,
			bundle: bundle
		};
	}
});
