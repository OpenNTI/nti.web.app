const Ext = require('extjs');

require('./SingleValuedSolution');


module.exports = exports = Ext.define('NextThought.model.assessment.MultipleChoiceSolution', {
	extend: 'NextThought.model.assessment.SingleValuedSolution',
	fields: [
		{ name: 'value', type: 'float' }
	]
});
