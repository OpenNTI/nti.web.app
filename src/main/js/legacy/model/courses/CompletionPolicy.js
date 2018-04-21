const Ext = require('@nti/extjs');

require('../Base');


module.exports = exports = Ext.define('NextThought.model.courses.CompletionPolicy', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.completion.aggregatecompletionpolicy',

	fields: [
		{ name: 'Class', type: 'string' },
		{ name: 'MimeType', type: 'string' },
		{ name: 'percentage', type: 'number' }
	]
});
