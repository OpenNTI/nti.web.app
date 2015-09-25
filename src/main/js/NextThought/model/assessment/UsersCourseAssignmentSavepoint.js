export default Ext.define('NextThought.model.assessment.UsersCourseAssignmentSavepoint', {
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.model.assessment.UsersCourseAssignmentSavepointItem'
	],

	fields: [
		{name: 'Items', type: 'collectionItem'}
	],


	getSavePoint: function(assignmentId) {
		return this.getFieldItem('Items', assignmentId);
	}
});
