Ext.define('NextThought.app.course.overview.components.editing.content.questionset.types.SelfAssessment', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-questionset-selfassessment',

	requires: [
		'NextThought.model.QuestionSetRef'
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
					isAdvanced: true,
					iconCls: 'assessment',
					description: '',
					editor: this
				}
			];
		},

		getEditorForRecord: function(record) {
			return this;
		}
	},

	cls: 'content-editor questionset self-assessment'
});
