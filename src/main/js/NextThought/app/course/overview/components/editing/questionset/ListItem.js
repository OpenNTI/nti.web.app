Ext.define('NextThought.app.course.overview.components.editing.questionset.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.ListItem',
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


	getPreviewType: function() {
		return this.assignment ? 'course-overview-assignment' : 'course-overview-naquestionset';
	}
});
