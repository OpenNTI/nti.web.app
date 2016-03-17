export default Ext.define('NextThought.app.course.overview.components.editing.content.questionset.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-questionset-listitem',

	statics: {
		isAssessmentWidget: true,
		getSupported: function() {
			return [
				NextThought.model.QuestionSetRef.mimeType,
				NextThought.model.AssignmentRef.mimeType
			];
		}
	},

	requires: [
		'NextThought.app.course.overview.components.parts.QuestionSet',
		'NextThought.model.QuestionSetRef',
		'NextThought.model.AssignmentRef'
	],


	updateRecord: function(record) {
		var me = this;

		me.course.getAssignments()
			.then(function(assignments) {
				me.assignment = assignments.getItem(record.get('Target-NTIID'));

				me.setRecord(record);
			});
	},


	getPreviewType: function() {
		return this.assignment ? 'course-overview-assignment' : 'course-overview-naquestionset';
	}
});
