Ext.define('NextThought.model.courseware.GradeBookPart', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Items', type: 'collectionItem'},
		{name: 'Name', type: 'string'},
		{name: 'displayName', type: 'string'},
		{name: 'gradeScheme', type: 'auto'},
		{name: 'order', type: 'int'}
	],


	findGradeBookEntryFor: function(assignmentId) {
		var items = this.get('Items'),
			map = items.INDEX_KEYMAP,
			assignment, item;

		for (assignment in map) {
			if (map.hasOwnProperty(assignment)) {
				item = items[map[assignment]];
				if (item.get('AssignmentId') === assignmentId) {
					return [assignment];
				}
			}
		}
	}
});
