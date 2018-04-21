const Ext = require('@nti/extjs');

const AssessedPart = require('./AssessedPart');

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

		from: function (q, placeholder) {
			var raw = {
				questionId: q.getId(),
				parts: []
			};

			q.get('parts').forEach(function () {
				raw.parts.push(new AssessedPart());
			});

			let out = this.create(raw);

			out.isPlaceholder = placeholder;

			return out;
		}
	}
});
