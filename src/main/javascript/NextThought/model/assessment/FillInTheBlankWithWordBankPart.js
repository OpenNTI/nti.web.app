Ext.define('NextThought.model.assessment.FillInTheBlankWithWordBankPart', {
	extend: 'NextThought.model.assessment.Part',
	requires: [
		'NextThought.model.assessment.WordBank'
	],
	fields: [
		{ name: 'wordbank', type: 'singleItem' }
	]
});
