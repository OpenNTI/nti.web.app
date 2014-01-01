Ext.define('NextThought.model.assessment.AssessedQuestion', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],
	idProperty: 'questionId',
	fields: [
		{ name: 'questionId', type: 'string' },
		{ name: 'parts', type: 'arrayItem' }
	],


	isCorrect: function() {
		var p = this.get('parts') || [],
			i = p.length - 1;

		for (i; i >= 0; i--) {
			if (!p[i].isCorrect()) {
				return false;
			}
		}

		return true;
	},


	statics: {

		from: function(q) {
			var raw = {
				questionId: q.getId(),
				parts: []
			};

			q.get('parts').forEach(function(p) {
				console.log(p);
				raw.parts.push(new NextThought.model.assessment.AssessedPart());
			});

			return this.create(raw);
		}
	}
});
