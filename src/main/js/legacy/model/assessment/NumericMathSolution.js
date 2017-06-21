const Ext = require('extjs');

require('./MathSolution');


module.exports = exports = Ext.define('NextThought.model.assessment.NumericMathSolution', {
	extend: 'NextThought.model.assessment.MathSolution',
	fields: [
		{ name: 'value', type: 'float' }
	]
});
