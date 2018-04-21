const Ext = require('@nti/extjs');

require('./Question');


module.exports = exports = Ext.define('NextThought.model.assessment.FillInTheBlankWithWordBankQuestion', {
	extend: 'NextThought.model.assessment.Question',
	mimeType: 'application/vnd.nextthought.naquestionfillintheblankwordbank',

	fields: [
		{ name: 'wordbank', type: 'singleItem' }
	]
});
