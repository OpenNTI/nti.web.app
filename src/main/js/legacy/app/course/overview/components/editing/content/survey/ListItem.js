const Ext = require('extjs');

const SurveyRef = require('legacy/model/SurveyRef');

require('../../../parts/Survey');
require('../ListItem');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.survey.ListItem', {
	extend: 'NextThought.app.course.overview.components.editing.content.ListItem',
	alias: 'widget.overview-editing-survey-listitem',

	statics: {
		getSupported: function () {
			return SurveyRef.mimeType;
		}
	},

	getPreviewType: function () {
		return 'course-overview-surveyref';
	}
});
