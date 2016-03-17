export default Ext.define('NextThought.model.assessment.OrderingPart', {
	extend: 'NextThought.model.assessment.Part',
	fields: [
		{ name: 'labels', type: 'auto' },
		{ name: 'values', type: 'auto' }
	]
});
