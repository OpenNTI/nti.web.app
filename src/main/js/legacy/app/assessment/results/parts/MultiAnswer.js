const Ext = require('@nti/extjs');

require('./MultiChoice');

module.exports = exports = Ext.define(
	'NextThought.app.assessment.results.parts.MultiAnswer',
	{
		extend: 'NextThought.app.assessment.results.parts.MultiChoice',
		alias: 'widget.assessment-multianswer-results',

		statics: {
			mimeType:
				'application/vnd.nextthought.assessment.aggregatedmultiplechoicemultipleanswerpart',
		},

		cls: 'result-part',
	}
);
