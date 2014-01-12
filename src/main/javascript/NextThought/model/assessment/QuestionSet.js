Ext.define('NextThought.model.assessment.QuestionSet', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],
	isSet: true,
	fields: [
		{ name: 'questions', type: 'arrayItem' }
	],


	tallyParts: function() {
		function sum(agg, r) {
			return agg + (r.tallyParts ? r.tallyParts() : 1);
		}
		return (this.get('questions') || []).reduce(sum, 0);
	},


	containsId: function(id) {
		var items = this.get('questions').filter(function(p) {
			return p && p.getId() === id;
		});

		return items.length > 0 || this.getId() === id;
	}
});
