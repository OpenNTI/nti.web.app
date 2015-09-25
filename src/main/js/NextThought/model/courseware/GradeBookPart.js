export default Ext.define('NextThought.model.courseware.GradeBookPart', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.gradebookpart',
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
	},


	buildEntry: function(name, id) {
		var items = this.get('Items'),
			entry = NextThought.model.courseware.GradeBookEntry.create({AssignmentId: id, Items: {}, Name: name}),
			key = items.length;

		if (Ext.isEmpty(name)) {
			Ext.Error.raise('No name');
		}

		if (Ext.isEmpty(id)) {
			Ext.Error.raise('No ID');
		}

		items.push(entry);
		items.INDEX_KEYMAP[name] = key;

		this.afterEdit(['Items']);
	}
});
