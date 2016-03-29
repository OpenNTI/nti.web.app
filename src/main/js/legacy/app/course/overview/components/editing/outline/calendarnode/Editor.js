var Ext = require('extjs');
var OutlinenodeEditor = require('../outlinenode/Editor');
var NavigationCourseOutlineCalendarNode = require('../../../../../../../model/courses/navigation/CourseOutlineCalendarNode');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.calendarnode.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.outline.outlinenode.Editor',
	alias: 'widget.overview-editing-calendarnode-editor',

	statics: {
		getHandledMimeTypes: function () {
			return [
				NextThought.model.courses.navigation.CourseOutlineCalendarNode.mimeType
			];
		},

		getTypes: function () {
			return [];
		}
	}
});
