const Ext = require('extjs');
require('./Part');


module.exports = exports = Ext.define('NextThought.model.assessment.OrderingPart', {
	extend: 'NextThought.model.assessment.Part',
	mimeType: [
		'application/vnd.nextthought.assessment.orderingpart',
		'application/vnd.nextthought.assessment.nongradableorderingpart'
	],
	fields: [
		{ name: 'labels', type: 'auto' },
		{ name: 'values', type: 'auto' }
	]
});
