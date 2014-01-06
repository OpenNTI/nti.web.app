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
		return (a !== null && a === 1) || a;//true, false, or null
	}
});
