const Ext = require('@nti/extjs');

require('./Base');

module.exports = exports = Ext.define('NextThought.model.SurveyRef', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'Target-NTIID', type: 'string' },
		{ name: 'label', type: 'string' },
		{ name: 'isClosed', type: 'bool' },
		{ name: 'question-count', type: 'string' },
		{ name: 'submissions', type: 'number' },
	],
});
