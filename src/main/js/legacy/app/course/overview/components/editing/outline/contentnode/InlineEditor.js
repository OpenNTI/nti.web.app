const Ext = require('@nti/extjs');

const CourseOutlineContentNode = require('legacy/model/courses/navigation/CourseOutlineContentNode');

require('../InlineEditor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.contentnode.InlineEditor', {
	extend: 'NextThought.app.course.overview.components.editing.outline.InlineEditor',
	alias: 'widget.overview-editing-contentnode-inline-editor',

	statics: {
		creationText: 'Add Lesson',

		getTypes: function () {
			return {
				mimeType: CourseOutlineContentNode.mimeType,
				types: []
			};
		}
	}
});
