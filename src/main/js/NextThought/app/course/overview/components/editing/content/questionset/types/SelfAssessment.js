Ext.define('NextThought.app.course.overview.components.editing.content.questionset.types.SelfAssessment', {
	extend: 'NextThought.app.course.overview.components.editing.content.questionset.types.Assignment',
	alias: 'widget.overview-editing-questionset-self-assessment',

	requires: [
		'NextThought.model.assessment.QuestionSet',
		'NextThought.model.QuestionSetRef',
		'NextThought.app.course.overview.components.editing.content.questionset.SelfAssessmentSelection',
		'NextThought.app.course.overview.components.editing.content.questionset.SelfAssessmentEditor'
	],

	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.QuestionSetRef.mimeType
			];
		},

		getTypes: function() {
			return [
				{
					title: 'Self Assessment',
					category: 'question-set',
					advanced: true,
					iconCls: 'assessment',
					description: '',
					editor: this
				}
			];
		},

		getEditorForRecord: function(record) {
			if (record instanceof NextThought.model.QuestionSetRef) {
				return this;
			}
		}
	},

	EDITOR_XTYPE: 'overview-editing-self-assessment-editor',
	LIST_XTYPE: 'overview-editing-self-assessment-selection',

	backToList: 'Self Assessments',

	SWITCHED: 'switched',

	cls: 'content-editor questionset self-assessment',


	afterRender: function() {
		this.callParent(arguments);

		if (this.loading) {
			this.el.mask('Loading...');
		}
	},


	getItemList: function() {
		return this.bundle.getAssignments()
			.then(function(assignments) {
				var nonAssignments = assignments.get('NonAssignments');

				return (nonAssignments || []).filter(function(item) {
					return item instanceof NextThought.model.assessment.QuestionSet;
				});
			});
	}
});
