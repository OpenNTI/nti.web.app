var Ext = require('extjs');
var AssessmentPart = require('./Part');


module.exports = exports = Ext.define('NextThought.model.assessment.OrderingPart', {
	extend: 'NextThought.model.assessment.Part',
	fields: [
		{ name: 'labels', type: 'auto' },
		{ name: 'values', type: 'auto' }
	]
});
