const Ext = require('extjs');
require('legacy/model/Base');


module.exports = exports = Ext.define('NextThought.model.assessment.AssignmentPart', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'auto_grade', type: 'bool' },
		{ name: 'content', type: 'string' },
		{ name: 'QuestionSetId', type: 'string'},
		{ name: 'question_set', type: 'singleItem' },
		{ name: 'title', type: 'string' }
	],

	tallyParts: function () {
		var s = this.get('question_set');
		return s ? s.tallyParts() : 0;
	}
});
