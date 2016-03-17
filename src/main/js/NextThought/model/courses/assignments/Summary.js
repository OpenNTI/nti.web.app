/*global User*/
export default Ext.define('NextThought.model.courses.assignments.Summary', {
	extend: 'NextThought.model.Base',

	requires: ['NextThought.model.User'],

	fields: [
		{name: 'Alias', type: 'string'},
		{name: 'Username', type: 'string'},
		{name: 'avatar', type: 'string', defaultValue: User.BLANK_AVATAR},
		{name: 'HistoryItemSummary', type: 'singleItem'},
		{name: 'PredictedGrade', type: 'auto'},
		{name: 'OverdueAssignmentCount', type: 'int'},
		{name: 'UngradedAssignmentCount', type: 'int'},
		{name: 'User', type: 'auto'},
		{name: 'AvailableAssignmentNTIIDs', type: 'auto'},
		{name: 'AvailableFinalGrade', type: 'bool'}
	],


	hasFinalGrade: function() {
		return this.get('AvailableFinalGrade');
	}
});
