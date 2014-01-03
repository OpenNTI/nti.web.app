Ext.define('NextThought.model.courseware.UsersCourseAssignmentHistoryItemFeedback', {
	extend: 'NextThought.model.Base',

	isFeedBack: true,

	fields: [
		{name: 'AssignmentId', type: 'string'},
		{name: 'body', type: 'auto'}
	]
});
