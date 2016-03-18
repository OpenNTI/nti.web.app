var Ext = require('extjs');
var ModelBase = require('../Base');
var ConvertersItems = require('../converters/Items');
var UtilParsing = require('../../util/Parsing');


module.exports = exports = Ext.define('NextThought.model.assessment.AssessedQuestionSet', {
    extend: 'NextThought.model.Base',
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
	},

    statics: {

		from: function(set) {
			var out, raw = {
				questionSetId: set.getId(),
				questions: []
			};

			set.get('questions').forEach(function(q) {
				raw.questions.push(NextThought.model.assessment.AssessedQuestion.from(q));
			});

			out = this.create(raw);
			out.noMark = true;

			return out;
		}
	}
});
