const Ext = require('@nti/extjs');

require('./Response');


module.exports = exports = Ext.define('NextThought.model.assessment.DictResponse', {
	extend: 'NextThought.model.assessment.Response',
	fields: [
		{ name: 'value', type: 'auto' }
	]
});
