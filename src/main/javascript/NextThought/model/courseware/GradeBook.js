Ext.define('NextThought.model.courseware.GradeBook', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Items', type: 'collectionItem'}
	],


	getItem: function(id, book) {
		var b = this.getFieldItem('Items', book || 'default');
		return b && b.getFieldItem('Items', id);
	},


	add: function(grade) {
		var path = grade.get('href')
				.replace(this.get('href'), '')//remove the prefix
				.replace(/^\//, '')//remove the initial separator
				.split('/')//make into a list
				.map(decodeURIComponent),//decode back into normal value
			book = this.getFieldItem('Items', path[0]),
			entry = book && book.getFieldItem('Items', path[1]);

		if (entry) {
			entry.addItem(grade);
		} else {
			console.warn('Coud not add built grade object to the gradebook.' + path, book, entry);
		}
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
