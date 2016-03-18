var Ext = require('extjs');
var AssessmentHint = require('./Hint');


module.exports = exports = Ext.define('NextThought.model.assessment.TextHint', {
	extend: 'NextThought.model.assessment.Hint',
	fields: [
		{ name: 'value', type: 'auto' }
	]
});
