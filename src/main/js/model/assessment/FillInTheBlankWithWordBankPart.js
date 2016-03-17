export default Ext.define('NextThought.model.assessment.FillInTheBlankWithWordBankPart', {
	extend: 'NextThought.model.assessment.Part',
	requires: [
		'NextThought.model.assessment.WordBank'
	],
	fields: [
		{ name: 'input', type: 'string' },
		{ name: 'wordbank', type: 'singleItem' }
	]
});
