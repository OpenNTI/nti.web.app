const Ext = require('@nti/extjs');

require('./BaseEvent');

module.exports = exports = Ext.define('NextThought.model.AssignmentCalendarEvent', {
	extend: 'NextThought.model.BaseEvent',
	mimeType: 'application/vnd.nextthought.assessment.assignmentcalendarevent',

	statics: {
		mimeType: 'application/vnd.nextthought.assessment.assignmentcalendarevent',
	},

	fields: [
		{name: 'total_points', type: 'number' },
		{name: 'MaximumTimeAllowed', type: 'number' },
		{name: 'IsTimedAssignment', type: 'boolean' }
	]

});
