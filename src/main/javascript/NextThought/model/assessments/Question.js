Ext.define('NextThought.model.assessments.Question', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.assessments.AssessedPart',
		'NextThought.model.assessments.AssessedQuestion',
		'NextThought.model.assessments.AssessedQuestionSet',
		'NextThought.model.assessments.DictResponse',
		'NextThought.model.assessments.FreeResponsePart',
		'NextThought.model.assessments.FreeResponseSolution',
		'NextThought.model.assessments.Hint',
		'NextThought.model.assessments.LatexSymbolicMathSolution',
		'NextThought.model.assessments.MatchingPart',
		'NextThought.model.assessments.MatchingSolution',
		'NextThought.model.assessments.MathPart',
		'NextThought.model.assessments.MathSolution',
		'NextThought.model.assessments.MultipleChoicePart',
		'NextThought.model.assessments.MultipleChoiceSolution',
		'NextThought.model.assessments.NumericMathPart',
		'NextThought.model.assessments.NumericMathSolution',
		'NextThought.model.assessments.Part',
		'NextThought.model.assessments.Response',
		'NextThought.model.assessments.SingleValuedSolution',
		'NextThought.model.assessments.Solution',
		'NextThought.model.assessments.SymbolicMathPart',
		'NextThought.model.assessments.SymbolicMathSolution',
		'NextThought.model.assessments.TextHint',
		'NextThought.model.assessments.TextResponse',
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],

	fields: [
		{ name: 'content', type: 'auto' },
		{ name: 'parts', type: 'arrayItem' }
	]
});
