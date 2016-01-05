Ext.define('NextThought.app.course.overview.components.editing.content.survey.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-survey-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.SurveyRef.mimeType;
		}
	},

	requires: [
		'NextThought.app.course.overview.components.parts.Survey',
		'NextThought.model.SurveyRef'
	],


	getPreviewType: function() {
		return 'course-overview-surveyref';
	}
});
