export default Ext.define('NextThought.model.assessment.Poll', {
	extend: 'NextThought.model.assessment.Question',
	mimeType: 'application/vnd.nextthought.napoll',

	fields: [
		{name: 'isClosed', type: 'Boolean'}
	]
});
