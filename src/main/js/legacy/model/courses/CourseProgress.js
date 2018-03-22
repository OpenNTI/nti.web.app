const Ext = require('extjs');

require('../Base');


module.exports = exports = Ext.define('NextThought.model.courses.CourseProgress', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.completion.progress',

	fields: [
		{ name: 'Class', type: 'string' },
		{ name: 'MimeType', type: 'string' },
		{ name: 'AbsoluteProgress', type: 'int' },
		{ name: 'Completed', type: 'bool' },
		{ name: 'CompletedDate', type: 'string' },
		{ name: 'HasProgress', type: 'bool' },
		{ name: 'MaxPossibleProgress', type: 'int' },
		{ name: 'PercentageProgress', type: 'number' }
	]
});
