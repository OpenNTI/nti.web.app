var Ext = require('extjs');
var OutlinenodeIndex = require('../outlinenode/Index');
var NavigationCourseOutlineCalendarNode = require('../../../../../../../model/courses/navigation/CourseOutlineCalendarNode');
var CalendarnodePreview = require('./Preview');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.calendarnode.Index', {
	extend: 'NextThought.app.course.overview.components.editing.outline.outlinenode.Index',
	alias: 'widget.overview-editing.calendarnode',

	statics: {
		getSupported: function() {
			return NextThought.model.courses.navigation.CourseOutlineCalendarNode.mimeType;
		}
	},

	PREVIEW_TYPE: 'overview-editing-outline-calendarnode-preview'
});
