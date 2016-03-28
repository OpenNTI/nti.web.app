const Ext = require('extjs');
require('./Part');


module.exports = exports = Ext.define('NextThought.model.assessment.MultipleChoicePart', {
	extend: 'NextThought.model.assessment.Part',
	mimeType: [
		'application/vnd.nextthought.assessment.multiplechoicepart',
		'application/vnd.nextthought.assessment.nongradablemultiplechoicepart',
		'application/vnd.nextthought.assessment.randomizedmultiplechoicepart'
	],
	fields: [
		{ name: 'solutions', type: 'arrayItem' },
		{ name: 'choices', type: 'auto' }
	]
});
