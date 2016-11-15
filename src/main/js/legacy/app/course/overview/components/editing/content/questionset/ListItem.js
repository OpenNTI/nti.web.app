var Ext = require('extjs');
var ContentListItem = require('../ListItem');
var PartsQuestionSet = require('../../../parts/QuestionSet');
var ModelQuestionSetRef = require('../../../../../../../model/QuestionSetRef');
var ModelAssignmentRef = require('../../../../../../../model/AssignmentRef');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.questionset.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-questionset-listitem',

	statics: {
		isAssessmentWidget: true,
		getSupported: function () {
			return [
				NextThought.model.QuestionSetRef.mimeType,
				NextThought.model.AssignmentRef.mimeType
			];
		}
	},

	updateRecord: function (record) {
		var me = this;

		me.course.getAssignments()
			.then(function (assignments) {
				me.assignment = assignments.getItem(record.get('Target-NTIID'));

				me.setRecord(record);
			});
	},


	setUpRecord (record) {
		const target = record.get('Target-NTIID');

		return this.course.getAssignments()
			.then((assignments) => {
				this.IsAssignment = assignments.getItem(target);
				this.assignment = assignments.getItem(target);
			});
	},


	getPreviewType: function () {
		return this.IsAssignment ? 'course-overview-assignment' : 'course-overview-naquestionset';
	}
});
