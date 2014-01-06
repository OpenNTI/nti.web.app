Ext.define('NextThought.model.assessment.AssessedPart', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],
	fields: [
		{ name: 'submittedResponse', type: 'auto' },
		{ name: 'assessedValue', type: 'int' }
	],

	isCorrect: function() {
		var a = this.get('assessedValue');
		return Ext.isNumber(a) ? a === 1 : null;//true, false, or null
	}
});
