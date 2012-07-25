Ext.define('NextThought.model.PageInfo', {
	extend: 'NextThought.model.Base',
	idProperty: 'ID',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing',
		'NextThought.model.assessments.Question'
	],
	fields: [
		{ name: 'AssessmentItems', type: 'arrayItem' },
		{ name: 'sharingPreference', type: 'auto' },
		{ name: 'dataFilterPreference', type: 'auto' }
	]
});
