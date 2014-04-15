Ext.define('NextThought.model.assessment.FillInTheBlankWithWordBankPart', {
	extend: 'NextThought.model.assessment.Part',
	requires: [
		'NextThought.model.assessment.WordBank'
	],
	fields: [
		{ name: 'content', type: 'string', convert: function() {return null;} },//replace with null
		{ name: 'partBody', type: 'string', mapping: 'content' },
		{ name: 'wordbank', type: 'singleItem' }
	]
});
