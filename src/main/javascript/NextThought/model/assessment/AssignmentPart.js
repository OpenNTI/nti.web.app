Ext.define('NextThought.model.assessment.AssignmentPart', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items'
	],
	fields: [
		{ name: 'auto_grade', type: 'bool' },
		{ name: 'content', type: 'string' },
		{ name: 'question_set', type: 'singleItem' },
		{ name: 'title', type: 'string' }
	],


	tallyParts: function() {
		var s = this.get('question_set');
		return s ? s.tallyParts() : 0;
	}
});
