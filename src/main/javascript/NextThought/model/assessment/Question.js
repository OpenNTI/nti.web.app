Ext.define('NextThought.model.assessment.Question', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.assessment.AssessedPart',
		'NextThought.model.assessment.AssessedQuestion',
		'NextThought.model.assessment.AssessedQuestionSet',
		'NextThought.model.assessment.DictResponse',
		'NextThought.model.assessment.FreeResponsePart',
		'NextThought.model.assessment.FreeResponseSolution',
		'NextThought.model.assessment.Hint',
		'NextThought.model.assessment.LatexSymbolicMathSolution',
		'NextThought.model.assessment.MatchingPart',
		'NextThought.model.assessment.MatchingSolution',
		'NextThought.model.assessment.MathPart',
		'NextThought.model.assessment.MathSolution',
		'NextThought.model.assessment.MultipleChoicePart',
		'NextThought.model.assessment.MultipleChoiceSolution',
		'NextThought.model.assessment.MultipleChoiceMultipleAnswerPart',
		'NextThought.model.assessment.MultipleChoiceMultipleAnswerSolution',
		'NextThought.model.assessment.NumericMathPart',
		'NextThought.model.assessment.NumericMathSolution',
		'NextThought.model.assessment.Part',
		'NextThought.model.assessment.Response',
		'NextThought.model.assessment.SingleValuedSolution',
		'NextThought.model.assessment.Solution',
		'NextThought.model.assessment.SymbolicMathPart',
		'NextThought.model.assessment.SymbolicMathSolution',
		'NextThought.model.assessment.TextHint',
		'NextThought.model.assessment.TextResponse',
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],

	fields: [
		{ name: 'content', type: 'auto' },
		{ name: 'parts', type: 'arrayItem' }
	],

	getVideos: function() {
		var all = NextThought.model.assessment.Part.prototype.getVideos.call(this);
		Ext.each(this.get('parts'), function(p) {
			all.push.apply(all, p.getVideos());
		});
		return all;
	},


	tallyParts: function() {
		function sum(agg, r) {
			return agg + (r.tallyParts ? r.tallyParts() : 1);
		}
		return (this.get('parts') || []).reduce(sum, 0);
	}
});
