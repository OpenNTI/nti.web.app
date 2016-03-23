var Ext = require('extjs');
var AssessmentSolution = require('./Solution');
var AssessmentWordBank = require('./WordBank');


module.exports = exports = Ext.define('NextThought.model.assessment.FillInTheBlankWithWordBankSolution', {
	extend: 'NextThought.model.assessment.Solution',

	fields: [
		{ name: 'value', type: 'auto' }
	]
});
