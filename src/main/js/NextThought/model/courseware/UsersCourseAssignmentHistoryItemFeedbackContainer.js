export default Ext.define('NextThought.model.courseware.UsersCourseAssignmentHistoryItemFeedbackContainer', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedbackcontainer',

	fields: [
		{name: 'Items', type: 'arrayItem', persist: false}
	],

	getCount: function() {
		return (this.get('Items') || []).length;
	}
});
