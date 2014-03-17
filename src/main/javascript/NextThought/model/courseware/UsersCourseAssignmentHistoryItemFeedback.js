Ext.define('NextThought.model.courseware.UsersCourseAssignmentHistoryItemFeedback', {
	extend: 'NextThought.model.Base',

	isFeedBack: true,

	fields: [
		{name: 'AssignmentId', type: 'string'},
		{name: 'body', type: 'auto'},
		{ name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime', persist: false, affectedBy: 'Last Modified'},
		{name: 'assignmentName', type: 'string', persist: false},
		{name: 'assignmentContainer', type: 'string', persist: false}
	]
});
