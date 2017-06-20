const Ext = require('extjs');

const CourseOutlineNode = require('legacy/model/courses/navigation/CourseOutlineNode');

const ContentnodeEditor = require('../contentnode/Editor');
// const OutlinenodeEditor = require('./Editor');

require('../../creation/ChildCreation');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.outlinenode.ChildCreation', {
	extend: 'NextThought.app.course.overview.components.editing.creation.ChildCreation',
	alias: 'widget.overview-editing-outlinenode-childcreation',
	title: 'Lesson',
	saveText: 'Add to Unit',

	statics: {
		getHandledMimeTypes: function () {
			return [
				CourseOutlineNode.mimeType
			];
		},

		getEditors: function () {
			return [
				ContentnodeEditor
				//I think this was meant to be:
				// OutlinenodeEditor
			];
		}
	},

	setUpTypeList: function () {
		this.callParent(arguments);
	}
});
