const Ext = require('@nti/extjs');

const SurveyRef = require('legacy/model/SurveyRef');
const Type = 'application/vnd.nextthought.nasurvey';

require('../questionset/types/Assignment');
require('./SurveySelection');
require('./SurveyEditor');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.survey.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.questionset.types.Assignment',
	alias: 'widget.overview-editing-survey',

	isAssignment: false,

	statics: {
		getHandledMimeTypes: function () {
			return [
				SurveyRef.mimeType
			];
		},

		getTypes: function () {
			return [
				{
					title: 'Survey',
					category: 'survey',
					advanced: false,
					iconCls: 'survey',
					description: '',
					editor: this,
					isAvailable: async (bundle) => {
						const available = await bundle.getAvailableContentSummary();

						return available[Type];
					}
				}
			];
		},

		getEditorForRecord: function (record) {
			if (record instanceof SurveyRef) {
				return this;
			}
		}
	},

	addFormCmp: function () {},

	EDITOR_XTYPE: 'overview-editing-survey-editor',
	LIST_XTYPE: 'overview-editing-survey-selection',
	backToList: 'Surveys',
	SWITCHED: 'switched',
	cls: 'content-editor survey',

	afterRender: function () {
		this.callParent(arguments);

		if (this.loading) {
			this.el.mask('Loading...');
		}
	},


	getItemList: function () {
		return this.bundle.getAllSurveys();
	},


	getSelectionFromRecord (record) {
		return this.bundle.getAllSurveys()
			.then(function (surveys) {
				const target = record.get('Target-NTIID');

				for (let survey of surveys) {
					if (survey.getId() === target) {
						return survey;
					}
				}
			});
	}
});
