var Ext = require('extjs');
var ModelBase = require('../Base');
var ConvertersItems = require('../converters/Items');
var UtilParsing = require('../../util/Parsing');


module.exports = exports = Ext.define('NextThought.model.assessment.QuestionSubmission', {
    extend: 'NextThought.model.Base',

    fields: [
		{ name: 'questionId', type: 'string' },
		{ name: 'parts', type: 'auto' },
		{ name: 'CreatorRecordedEffortDuration', type: 'int' }
	],

    isCorrect: function() { return null; }
});
