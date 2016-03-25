var Ext = require('extjs');
var AssessmentPart = require('./Part');


module.exports = exports = Ext.define('NextThought.model.assessment.MultipleChoicePart', {
	extend: 'NextThought.model.assessment.Part',
	fields: [
		{ name: 'solutions', type: 'arrayItem' },
		{ name: 'choices', type: 'auto' }
	]
},function () {
	NextThought.model.MAP['application/vnd.nextthought.assessment.randomizedmultiplechoicepart'] = this.$className;
});
