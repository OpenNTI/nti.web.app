var Ext = require('extjs');
var AssessmentPart = require('./Part');
var AssessmentWordBank = require('./WordBank');


module.exports = exports = Ext.define('NextThought.model.assessment.FillInTheBlankWithWordBankPart', {
	extend: 'NextThought.model.assessment.Part',

	fields: [
		{ name: 'input', type: 'string' },
		{ name: 'wordbank', type: 'singleItem' }
	]
});
