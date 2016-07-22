var Ext = require('extjs');
var TypesAssignment = require('./Assignment');
var AssessmentQuestionSet = require('../../../../../../../../model/assessment/QuestionSet');
var ModelQuestionSetRef = require('../../../../../../../../model/QuestionSetRef');
var QuestionsetSelfAssessmentSelection = require('../SelfAssessmentSelection');
var QuestionsetSelfAssessmentEditor = require('../SelfAssessmentEditor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.questionset.types.SelfAssessment', {
	extend: 'NextThought.app.course.overview.components.editing.content.questionset.types.Assignment',
	alias: 'widget.overview-editing-questionset-self-assessment',

	statics: {
		getHandledMimeTypes: function () {
			return [
				NextThought.model.QuestionSetRef.mimeType
			];
		},

		getTypes: function () {
			return [
				{
					title: 'Self Assessment',
					category: 'question-set',
					advanced: false,
					iconCls: 'assessment',
					description: '',
					editor: this
				}
			];
		},

		getEditorForRecord: function (record) {
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
	isAssignment: false,

	afterRender: function () {
		this.callParent(arguments);

		if (this.loading) {
			this.el.mask('Loading...');
		}
	},

	getItemList: function () {
		return this.bundle.getAllAssessments();
	}
});
