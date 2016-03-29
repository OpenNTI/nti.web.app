const Ext = require('extjs');

require('legacy/model/Base');


module.exports = exports = Ext.define('NextThought.model.assessment.AssessedQuestion', {
	extend: 'NextThought.model.Base',
	idProperty: 'questionId',

	fields: [
		{ name: 'questionId', type: 'string' },
		{ name: 'parts', type: 'arrayItem' }
	],

	isCorrect: function () {
		var p = this.get('parts') || [],
			i = p.length - 1, v;

		for (i; i >= 0; i--) {
			v = p[i].isCorrect();
			if (!v) {
				return v;
			}
		}

		return true;
	},

	statics: {

		from: function (q) {
			var raw = {
				questionId: q.getId(),
				parts: []
			};

			q.get('parts').forEach(function () {
				raw.parts.push(new NextThought.model.assessment.AssessedPart());
			});

			return this.create(raw);
		}
	}
});
