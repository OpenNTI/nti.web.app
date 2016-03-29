const Ext = require('extjs');
require('./Part');


module.exports = exports = Ext.define('NextThought.model.assessment.MultipleChoiceMultipleAnswerPart', {
	extend: 'NextThought.model.assessment.Part',
	mimeType: [
		'application/vnd.nextthought.assessment.multiplechoicemultipleanswerpart',
		'application/vnd.nextthought.assessment.nongradablemultiplechoicemultipleanswerpart',
		'application/vnd.nextthought.assessment.randomizedmultiplechoicemultipleanswerpart'
	],
	fields: [
		{ name: 'solutions', type: 'arrayItem' },
		{ name: 'choices', type: 'auto' }
	]
});
