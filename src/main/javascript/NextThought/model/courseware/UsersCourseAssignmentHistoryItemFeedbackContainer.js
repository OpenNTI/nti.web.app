Ext.define('NextThought.model.courseware.UsersCourseAssignmentHistoryItemFeedbackContainer', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Items', type: 'arrayItem', persist: false}
	],

	getCount: function() {
		return (this.get('Items') || []).length;
	}
});
