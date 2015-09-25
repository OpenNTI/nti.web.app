export default Ext.define('NextThought.model.assessment.FillInTheBlankWithWordBankQuestion', {
	extend: 'NextThought.model.assessment.Question',
	mimeType: 'application/vnd.nextthought.naquestionfillintheblankwordbank',

	fields: [
		{ name: 'wordbank', type: 'singleItem' }
	]
});
