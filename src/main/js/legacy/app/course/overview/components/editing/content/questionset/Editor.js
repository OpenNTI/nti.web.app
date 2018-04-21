const Ext = require('@nti/extjs');

const TypesSelfAssessment = require('./types/SelfAssessment');
const TypesAssignment = require('./types/Assignment');

require('../../EditorGroup');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.questionset.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.EditorGroup',
	alias: 'widget.overview-editing-contentlink-editor',

	statics: {
		getSubEditors: function () {
			return [
				TypesSelfAssessment,
				TypesAssignment
			];
		}
	}
});
