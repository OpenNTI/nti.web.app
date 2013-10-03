Ext.define('NextThought.model.assessment.AssessedQuestionSet', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],
	idProperty: 'questionSetId',
	isSet: true,

	fields: [
		{ name: 'questions', type: 'arrayItem' },
		{ name: 'questionSetId', type: 'string' }
	],


	getTotalCount: function() {
		return (this.get('questions') || []).length;
	},


	getCorrectCount: function() {

		var correct = 0;
		Ext.each(this.get('questions'), function(q) {
			if (q.isCorrect()) {correct++;}
		});

		return correct;
	}
});
