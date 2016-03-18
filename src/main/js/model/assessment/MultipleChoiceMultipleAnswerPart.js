var Ext = require('extjs');
var AssessmentPart = require('./Part');


module.exports = exports = Ext.define('NextThought.model.assessment.MultipleChoiceMultipleAnswerPart', {
	extend: 'NextThought.model.assessment.Part',
	fields: [
		{ name: 'solutions', type: 'arrayItem' },
		{ name: 'choices', type: 'auto' }
	]
},function() {
    NextThought.model.MAP['application/vnd.nextthought.assessment.randomizedmultiplechoicemultipleanswerpart'] = this.$className;
});
