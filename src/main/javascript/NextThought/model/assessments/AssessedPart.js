Ext.define('NextThought.model.assessments.AssessedPart', {
	extend: 'NextThought.model.Base',
	fields: [
		{ name: 'submittedResponse', type: 'auto' },
		{ name: 'assessedValue', type: 'float' }
	]
});
