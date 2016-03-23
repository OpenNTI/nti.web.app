var Ext = require('extjs');
var OutlineInlineEditor = require('../InlineEditor');
var NavigationCourseOutlineContentNode = require('../../../../../../../model/courses/navigation/CourseOutlineContentNode');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.contentnode.InlineEditor', {
	extend: 'NextThought.app.course.overview.components.editing.outline.InlineEditor',
	alias: 'widget.overview-editing-contentnode-inline-editor',

	statics: {
		creationText: 'Add Lesson',

		getTypes: function() {
			return {
				mimeType: NextThought.model.courses.navigation.CourseOutlineContentNode.mimeType,
				types: []
			};
		}
	}
});
