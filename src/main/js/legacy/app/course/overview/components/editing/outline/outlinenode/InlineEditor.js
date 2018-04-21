const Ext = require('@nti/extjs');

const CourseOutlineNode = require('legacy/model/courses/navigation/CourseOutlineNode');

require('../InlineEditor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.outlinenode.InlineEditor', {
	extend: 'NextThought.app.course.overview.components.editing.outline.InlineEditor',
	alias: 'widget.overview-editing-outlinenode-inline-editor',

	statics: {
		creationText: 'Add Unit',

		getTypes: function () {
			return {
				mimeType: CourseOutlineNode.mimeType,
				types: []
			};
		}
	}
});
