const Ext = require('@nti/extjs');

require('./AssignmentSelection');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.questionset.SelfAssessmentSelection', {
	extend: 'NextThought.app.course.overview.components.editing.content.questionset.AssignmentSelection',
	alias: 'widget.overview-editing-self-assessment-selection',

	cls: 'assessment-item-selection item-selection',

	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{cls: 'self-assessment-item', cn: [
			{cls: 'title', html: '{title}'},
			{cls: 'question-count', html: '{questionCount}'}
		]}
	)),


	getItemData: function (item) {
		var questionCount = item.getQuestionCount();

		return {
			title: item.get('title'),
			questionCount: Ext.util.Format.plural(questionCount, 'Question')
		};
	}
});
