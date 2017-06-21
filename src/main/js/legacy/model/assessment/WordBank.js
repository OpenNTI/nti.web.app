const Ext = require('extjs');

require('../Base');


module.exports = exports = Ext.define('NextThought.model.assessment.WordBank', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.naqwordbank',
	fields: [
		{ name: 'entries', type: 'arrayItem' },
		{ name: 'unique', type: 'bool' }
	]
});
