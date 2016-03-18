var Ext = require('extjs');
var EditingEditorGroup = require('../../EditorGroup');
var TypesSelfAssessment = require('./types/SelfAssessment');
var TypesAssignment = require('./types/Assignment');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.questionset.Editor', {
    extend: 'NextThought.app.course.overview.components.editing.EditorGroup',
    alias: 'widget.overview-editing-contentlink-editor',

    statics: {
		getSubEditors: function() {
			var base = NextThought.app.course.overview.components.editing.content.questionset.types;

			return [
				base.SelfAssessment,
				base.Assignment
			];
		}
	}
});
