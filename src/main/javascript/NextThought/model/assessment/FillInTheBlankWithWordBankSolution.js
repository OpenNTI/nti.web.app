Ext.define('NextThought.model.assessment.FillInTheBlankWithWordBankSolution', {
	extend: 'NextThought.model.assessment.Solution',
	requires: [
		'NextThought.model.assessment.WordBank'
	],
	fields: [
		{ name: 'value', type: 'auto' }
	]
});
