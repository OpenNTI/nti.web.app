export default Ext.define('NextThought.app.course.overview.components.editing.outline.calendarnode.Index', {
	extend: 'NextThought.app.course.overview.components.editing.outline.outlinenode.Index',
	alias: 'widget.overview-editing.calendarnode',


	statics: {
		getSupported: function() {
			return NextThought.model.courses.navigation.CourseOutlineCalendarNode.mimeType;
		}
	},

	PREVIEW_TYPE: 'overview-editing-outline-calendarnode-preview',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineCalendarNode',
		'NextThought.app.course.overview.components.editing.outline.calendarnode.Preview'
	]
});
