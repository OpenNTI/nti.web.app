var Ext = require('extjs');
var ContentListItem = require('../ListItem');
var PartsSurvey = require('../../../parts/Survey');
var ModelSurveyRef = require('../../../../../../../model/SurveyRef');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.survey.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-survey-listitem',

	statics: {
		getSupported: function() {
			return NextThought.model.SurveyRef.mimeType;
		}
	},

	getPreviewType: function() {
		return 'course-overview-surveyref';
	}
});
