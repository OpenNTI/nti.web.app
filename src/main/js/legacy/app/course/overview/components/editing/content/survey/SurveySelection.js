var Ext = require('extjs');
var QuestionsetAssignmentSelection = require('../questionset/AssignmentSelection');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.survey.SurveySelection', {
	extend: 'NextThought.app.course.overview.components.editing.content.questionset.AssignmentSelection',
	alias: 'widget.overview-editing-survey-selection',

	cls: 'survey-item-selection item-selection',

	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{cls: 'survey-item', cn: [
			{cls: 'title', html: '{title}'},
			{cls: 'question-count', html: '{questionCount}'}
		]}
	)),


	getItemData: function (item) {
		var questions = item.get('questions') || [],
			questionCount = questions.length;

		return {
			title: item.get('title'),
			questionCount: Ext.util.Format.plural(questionCount, 'Question')
		};
	}
});
