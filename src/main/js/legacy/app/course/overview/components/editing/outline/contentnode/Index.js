const Ext = require('@nti/extjs');

const CourseOutlineContentNode = require('legacy/model/courses/navigation/CourseOutlineContentNode');

require('../calendarnode/Index');
require('./Preview');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.contentnode.Index', {
	extend: 'NextThought.app.course.overview.components.editing.outline.calendarnode.Index',
	alias: 'widget.overview-editing-contentnode',

	statics: {
		getSupported: function () {
			return CourseOutlineContentNode.mimeType;
		}
	},

	PREVIEW_TYPE: 'overview-editing-outline-contentnode-preview',
	hasItems: false,
	hasContents: true
});
