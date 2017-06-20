const Ext = require('extjs');

const QuestionSetRef = require('legacy/model/QuestionSetRef');
const AssignmentRef = require('legacy/model/AssignmentRef');

require('../../../parts/QuestionSet');
require('../ListItem');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.questionset.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-questionset-listitem',

	statics: {
		isAssessmentWidget: true,
		getSupported: function () {
			return [
				QuestionSetRef.mimeType,
				AssignmentRef.mimeType
			];
		}
	},

	updateRecord: function (record) {
		var me = this;

		me.course.getAssignments()
			.then(function (assignments) {
				me.IsAssignment = assignments.isAssignment(record.get('Target-NTIID'));
				me.assignment = assignments.getItem(record.get('Target-NTIID'));

				me.setRecord(record);
			});
	},


	setUpRecord (record) {
		const target = record.get('Target-NTIID');

		return this.course.getAssignments()
			.then((assignments) => {
				this.IsAssignment = assignments.isAssignment(target);
				this.assignment = assignments.getItem(target);

				if (this.IsAssignment && !this.assignment) {
					this.hide();
				}
			});
	},


	getPreviewType: function () {
		return this.IsAssignment ? 'course-overview-assignment' : 'course-overview-naquestionset';
	},


	doNavigation (config) {
		if (this.navigate) {
			this.navigate(config, null, this.IsAssignment);
		}
	}
});
