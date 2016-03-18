var Ext = require('extjs');
var OutlineInlineEditor = require('../InlineEditor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.outlinenode.InlineEditor', {
	extend: 'NextThought.app.course.overview.components.editing.outline.InlineEditor',
	alias: 'widget.overview-editing-outlinenode-inline-editor',

	statics: {
		creationText: 'Add Unit',

		getTypes: function() {
			return {
				mimeType: NextThought.model.courses.navigation.CourseOutlineNode.mimeType,
				types: []
			};
		}
	}
});
