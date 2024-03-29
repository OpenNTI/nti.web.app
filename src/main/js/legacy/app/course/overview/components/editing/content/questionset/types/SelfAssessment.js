const Ext = require('@nti/extjs');
const QuestionSetRef = require('internal/legacy/model/QuestionSetRef');

require('internal/legacy/model/assessment/QuestionSet');
require('../SelfAssessmentSelection');
require('../SelfAssessmentEditor');
require('./Assignment');

const Type = 'application/vnd.nextthought.naquestionset';

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.questionset.types.SelfAssessment',
	{
		extend: 'NextThought.app.course.overview.components.editing.content.questionset.types.Assignment',
		alias: 'widget.overview-editing-questionset-self-assessment',

		statics: {
			getHandledMimeTypes: function () {
				return [QuestionSetRef.mimeType];
			},

			getTypes: function () {
				return [
					{
						title: 'Self Assessment',
						category: 'question-set',
						advanced: false,
						iconCls: 'assessment',
						description: '',
						editor: this,
						isAvailable: async bundle => {
							const available =
								await bundle.getAvailableContentSummary();

							return available[Type];
						},
					},
				];
			},

			getEditorForRecord: function (record) {
				if (record instanceof QuestionSetRef) {
					return this;
				}
			},
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
		},
	}
);
