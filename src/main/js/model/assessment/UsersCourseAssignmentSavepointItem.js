var Ext = require('extjs');
var ModelBase = require('../Base');


module.exports = exports = Ext.define('NextThought.model.assessment.UsersCourseAssignmentSavepointItem', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Submission', type: 'singleItem', persist: false}
	],


	getQuestionSetSubmission: function() {
		var sub = this.get('Submission'),
			parts = sub && sub.get('parts');

		if (parts.length === 0) {
			console.error('No parts for the question submission');
			return null;
		}

		if (parts.length > 1) {
			console.error('More than one part in the question submission throw away all but the first', parts);
		}

		return parts[0];
	}
});
