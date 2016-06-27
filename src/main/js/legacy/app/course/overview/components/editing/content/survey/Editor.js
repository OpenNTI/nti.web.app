var Ext = require('extjs');
var TypesAssignment = require('../questionset/types/Assignment');
var ModelSurveyRef = require('../../../../../../../model/SurveyRef');
var QuestionsetSurveySelection = require('./SurveySelection');
var QuestionsetSurveyEditor = require('./SurveyEditor');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.survey.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.questionset.types.Assignment',
	alias: 'widget.overview-editing-survey',

	statics: {
		getHandledMimeTypes: function () {
			return [
				NextThought.model.SurveyRef.mimeType
			];
		},

		getTypes: function () {
			return [
				{
					title: 'Pick a Survey',
					category: 'survey',
					advanced: false,
					iconCls: 'survey',
					description: '',
					editor: this
				}
			];
		},

		getEditorForRecord: function (record) {
			if (record instanceof NextThought.model.SurveyRef) {
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
	}
});
