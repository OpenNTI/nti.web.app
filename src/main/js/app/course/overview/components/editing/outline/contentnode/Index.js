var Ext = require('extjs');
var CalendarnodeIndex = require('../calendarnode/Index');
var NavigationCourseOutlineContentNode = require('../../../../../../../model/courses/navigation/CourseOutlineContentNode');
var ContentnodePreview = require('./Preview');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.contentnode.Index', {
    extend: 'NextThought.app.course.overview.components.editing.outline.calendarnode.Index',
    alias: 'widget.overview-editing-contentnode',

    statics: {
		getSupported: function() {
			return NextThought.model.courses.navigation.CourseOutlineContentNode.mimeType;
		}
	},

    PREVIEW_TYPE: 'overview-editing-outline-contentnode-preview',
    hasItems: false,
    hasContents: true
});
