Ext.define('NextThought.model.assessment.FillInTheBlankShortAnswerPart', {
	extend: 'NextThought.model.assessment.FreeResponsePart',
	fields: [
		{ name: 'content', type: 'string', convert: function(v) {
			console.debug(v);
			return v;
		}}
	]
});
