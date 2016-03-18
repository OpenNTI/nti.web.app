var Ext = require('extjs');
var AssessmentSolution = require('./Solution');


module.exports = exports = Ext.define('NextThought.model.assessment.LatexSymbolicMathSolution', {
	extend: 'NextThought.model.assessment.Solution',
	fields: [
		{ name: 'value', type: 'string' }
	]
});
