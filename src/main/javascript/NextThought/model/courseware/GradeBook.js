Ext.define('NextThought.model.courseware.GradeBook', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Items', type: 'collectionItem'}
	],


	getItem: function(id, book) {
		var b = this.getFieldItem('Items', book || 'default');
		return b && b.getFieldItem('Items', id);
	},


	findGradeBookEntryFor: function(assignmentId) {
		var items = this.get('Items'),
			map = items.INDEX_KEYMAP,
			part, item, entry;

		for (part in map) {
			if (map.hasOwnProperty(part)) {
				item = items[map[part]];
				entry = item.findGradeBookEntryFor(assignmentId);
				if (entry) {
					return [part].concat(entry);
				}
			}
		}
	}
});
