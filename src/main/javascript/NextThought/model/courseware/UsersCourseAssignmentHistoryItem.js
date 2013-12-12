Ext.define('NextThought.model.courseware.UsersCourseAssignmentHistoryItem', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Feedback', type: 'singleItem', persist: false},
		{name: 'Grade', type: 'singleItem', persist: false},
		{name: 'Submission', type: 'singleItem', persist: false},
		{name: 'pendingAssessment', type: 'singleItem'}
	]
});
