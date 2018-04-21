const Ext = require('@nti/extjs');
require('./Part');


module.exports = exports = Ext.define('NextThought.model.assessment.MatchingPart', {
	extend: 'NextThought.model.assessment.Part',
	mimeType: [
		'application/vnd.nextthought.assessment.matchingpart',
		'application/vnd.nextthought.assessment.nongradablematchingpart',
		'application/vnd.nextthought.assessment.randomizedmatchingpart'
	],
	fields: [
		{ name: 'labels', type: 'auto' },
		{ name: 'values', type: 'auto' }
	]
});
