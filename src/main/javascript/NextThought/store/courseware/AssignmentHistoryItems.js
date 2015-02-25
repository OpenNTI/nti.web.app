/*globals User*/
Ext.define('NextThought.store.courseware.AssignmentHistoryItems', {
	extend: 'NextThought.store.courseware.GradeBookSummaries',

	fields: [
		{name: 'Alias', type: 'string'},
		{name: 'Username', type: 'string'},
		{name: 'avatar', type: 'string', defaultValue: User.BLANK_AVATAR},
		{name: 'Grade', type: 'auto'},
		{name: 'HistoryItemSummary', type: 'auto'},
		{name: 'User', type: 'auto'}
	],


	getAssignment: function() {
		return this.assignment;
	}
});
