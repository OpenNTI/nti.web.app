const Ext = require('extjs');

const CourseOutlineCalendarNode = require('legacy/model/courses/navigation/CourseOutlineCalendarNode');

require('../outlinenode/Editor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.calendarnode.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.outline.outlinenode.Editor',
	alias: 'widget.overview-editing-calendarnode-editor',

	statics: {
		getHandledMimeTypes: function () {
			return [
				CourseOutlineCalendarNode.mimeType
			];
		},

		getTypes: function () {
			return [];
		}
	}
});
