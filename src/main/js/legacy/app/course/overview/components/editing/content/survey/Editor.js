var Ext = require('extjs');
var ContentEditor = require('../Editor');
var ModelSurveyRef = require('../../../../../../../model/SurveyRef');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.survey.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
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
					title: 'Pick A Survey',
					advanced: false,
					category: 'Survey',
					iconCls: 'survey',
					description: '',
					editor: this
				}
			];
		}
	},

	addFormCmp: function () {}
});
