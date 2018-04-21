const Ext = require('@nti/extjs');

require('../Base');


module.exports = exports = Ext.define('NextThought.model.assessment.Solution', {
	extend: 'NextThought.model.Base',
	fields: [
		{name: 'weight', type: 'float'}
	]
});
