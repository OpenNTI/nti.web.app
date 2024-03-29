const Ext = require('@nti/extjs');
const CourseOutlineCalendarNode = require('internal/legacy/model/courses/navigation/CourseOutlineCalendarNode');

require('../outlinenode/Index');
require('./Preview');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.outline.calendarnode.Index',
	{
		extend: 'NextThought.app.course.overview.components.editing.outline.outlinenode.Index',
		alias: 'widget.overview-editing.calendarnode',

		statics: {
			getSupported: function () {
				return CourseOutlineCalendarNode.mimeType;
			},
		},

		hideItemsIfEmpty: true,

		PREVIEW_TYPE: 'overview-editing-outline-calendarnode-preview',
	}
);
