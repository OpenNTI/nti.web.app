export default Ext.define('NextThought.app.course.overview.components.editing.content.survey.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-survey',

	requires: ['NextThought.model.SurveyRef'],

	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.SurveyRef.mimeType
			];
		}
	},

	addFormCmp: function() {}
});
