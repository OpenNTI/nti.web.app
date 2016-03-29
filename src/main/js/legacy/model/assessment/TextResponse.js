var Ext = require('extjs');
var AssessmentResponse = require('./Response');


module.exports = exports = Ext.define('NextThought.model.assessment.TextResponse', {
	extend: 'NextThought.model.assessment.Response',
	fields: [
		{ name: 'value', type: 'string' }
	]
});
