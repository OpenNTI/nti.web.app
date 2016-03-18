var Ext = require('extjs');
var ModelBase = require('../Base');
var ConvertersItems = require('../converters/Items');
var UtilParsing = require('../../util/Parsing');


module.exports = exports = Ext.define('NextThought.model.assessment.QuestionSetSubmission', {
    extend: 'NextThought.model.Base',
    isSet: true,

    fields: [
		{ name: 'questionSetId', type: 'string' },
		{ name: 'questions', type: 'arrayItem' },
		{ name: 'CreatorRecordedEffortDuration', type: 'int' }
	]
});
