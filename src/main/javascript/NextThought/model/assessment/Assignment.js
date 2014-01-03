Ext.define('NextThought.model.assessment.Assignment', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items'
	],
	isAssignment: true,
	fields: [
		{ name: 'containerId', type: 'string' },//lowercase C?
		{ name: 'content', type: 'string' },
		{ name: 'availableBeginning', type: 'date', mapping: 'available_for_submission_beginning' },
		{ name: 'availableEnding', type: 'date', mapping: 'available_for_submission_ending' },
		{ name: 'parts', type: 'arrayItem' },
		{ name: 'title', type: 'string' },
		{ name: 'SubmittedCount', type: 'int', mapping: 'GradeSubmittedCount'}
	],


	containsId: function(id){
		var items = this.get('parts').filter(function(p){
			p = p.get('question_set');
			return p && p.getId() === id;
		});

		return items.length > 0;
	},


	getDueDate: function() {
		return this.get('availableEnding') || this.get('availableBeginning');
	},


	tallyParts: function() {
		function sum(agg, r) {
			return agg + (r.tallyParts ? r.tallyParts() : 1);
		}
		return (this.get('parts') || []).reduce(sum, 0);
	}
});
