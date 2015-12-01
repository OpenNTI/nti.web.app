Ext.define('NextThought.app.course.overview.components.editing.survey.ListItem', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-survey-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.SurveyRef.mimeType;
		}
	},

	requires: [
		'NextThought.app.course.overview.components.editing.survey.Preview',
		'NextThought.model.SurveyRef'
	],


	layout: 'none',

	items: [
		{xtype: 'box', autoEl: {html: 'Survey'}}
	]
});
