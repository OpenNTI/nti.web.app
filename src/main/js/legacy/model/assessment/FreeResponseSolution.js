const Ext = require('@nti/extjs');

require('./SingleValuedSolution');


module.exports = exports = Ext.define('NextThought.model.assessment.FreeResponseSolution', {
	extend: 'NextThought.model.assessment.SingleValuedSolution',
	fields: [
		{ name: 'value', type: 'string' }
	]
});
