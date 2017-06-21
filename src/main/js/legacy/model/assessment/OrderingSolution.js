const Ext = require('extjs');

require('./Solution');


module.exports = exports = Ext.define('NextThought.model.assessment.OrderingSolution', {
	extend: 'NextThought.model.assessment.Solution',
	fields: [
		{ name: 'value', type: 'auto' }
	]
});
