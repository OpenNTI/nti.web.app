var Ext = require('extjs');
var ModelBase = require('../Base');


module.exports = exports = Ext.define('NextThought.model.courses.CourseCreditLegacyInfo', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'Class', type: 'string' },
		{ name: 'MimeType', type: 'string' },
		{ name: 'Hours', type: 'string' },
		{ name: 'Enrollment', type: 'auto' }
	]
});
