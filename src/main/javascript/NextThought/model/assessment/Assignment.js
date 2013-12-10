Ext.define('NextThought.model.assessment.Assignment', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items'
	],
	fields: [
		{ name: 'containerId', type: 'string' },//lowercase C?
		{ name: 'content', type: 'string' },
		{ name: 'availableBeginning', type: 'date', mapping: 'available_for_submission_beginning' },
		{ name: 'availableEnding', type: 'date', mapping: 'available_for_submission_ending' },
		{ name: 'parts', type: 'arrayItem' },
		{ name: 'title', type: 'string' }
	]
});
