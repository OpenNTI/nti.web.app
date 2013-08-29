Ext.define('NextThought.model.assessment.AssessedPart', {
	extend:   'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],
	fields:   [
		{ name: 'submittedResponse', type: 'auto' },
		{ name: 'assessedValue', type: 'int' }
	],

	isCorrect: function () {
		return this.get('assessedValue') === 1;
	}
});
