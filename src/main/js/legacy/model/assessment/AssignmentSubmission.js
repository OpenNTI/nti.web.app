var Ext = require('extjs');
var ModelBase = require('../Base');


module.exports = exports = Ext.define('NextThought.model.assessment.AssignmentSubmission', {
	extend: 'NextThought.model.Base',
	fields: [
		{name: 'assignmentId', type: 'string'},
		{name: 'parts', type: 'arrayItem'},
		{name: 'CreatorRecordedEffortDuration', type: 'int'}
	]
});
