const Ext = require('extjs');

const AssessedQuestion = require('./AssessedQuestion');

require('legacy/model/Base');


module.exports = exports = Ext.define('NextThought.model.assessment.AssessedQuestionSet', {
	extend: 'NextThought.model.Base',
	idProperty: 'questionSetId',
	isSet: true,

	fields: [
		{ name: 'questions', type: 'arrayItem' },
		{ name: 'questionSetId', type: 'string' }
	],

	getTotalCount: function () {
		return (this.get('questions') || []).length;
	},

	getCorrectCount: function () {

		var correct = 0;
		Ext.each(this.get('questions'), function (q) {
			if (q.isCorrect()) {correct++;}
		});

		return correct;
	},

	statics: {

		from: function (set, placeholder) {
			var out, raw = {
				questionSetId: set.getId(),
				questions: []
			};

			set.get('questions').forEach(function (q) {
				raw.questions.push(AssessedQuestion.from(q, placeholder));
			});

			out = this.create(raw);
			out.noMark = true;
			out.isPlaceholder = placeholder;

			return out;
		}
	}
});
