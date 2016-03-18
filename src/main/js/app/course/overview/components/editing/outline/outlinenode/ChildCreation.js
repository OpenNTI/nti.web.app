var Ext = require('extjs');
var CreationChildCreation = require('../../creation/ChildCreation');
var NavigationCourseOutlineNode = require('../../../../../../../model/courses/navigation/CourseOutlineNode');
var OutlinenodeEditor = require('./Editor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.outlinenode.ChildCreation', {
    extend: 'NextThought.app.course.overview.components.editing.creation.ChildCreation',
    alias: 'widget.overview-editing-outlinenode-childcreation',
    title: 'Lesson',
    saveText: 'Add to Unit',

    statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.courses.navigation.CourseOutlineNode.mimeType
			];
		},

		getEditors: function() {
			var base = NextThought.app.course.overview.components.editing.outline;

			return [
				base.contentnode.Editor
			];
		}
	},

    setUpTypeList: function() {
		this.callParent(arguments);
	}
});
