const Ext = require('extjs');

const GradeBookEntry = require('./GradeBookEntry');
const GradeBookPart = require('./GradeBookPart');

require('../Base');


module.exports = exports = Ext.define('NextThought.model.courseware.GradeBook', {
	extend: 'NextThought.model.Base',

	mimeType: 'application/vnd.nextthought.gradebook',

	fields: [
		{name: 'Items', type: 'collectionItem'}
	],


	getItem: function (key, book, assignmentId) {
		var b = this.getFieldItem('Items', book || 'default'),
			i = b && b.getFieldItem('Items', key);

		try {
			if (assignmentId && (!i || i.get('AssignmentId') !== assignmentId)) {
				i = this.findGradeBookEntryFor(assignmentId) || [];
				i = i.reduce(function (a, c) { return a.getFieldItem('Items', c); }, this);
				if (!GradeBookEntry.isInstanceOf(i)) {
					i = null;
				}
			}
		} catch (e) {
			console.error(e.stack || e.message || e);
		}

		return i;
	},


	add: function (grade, assignmentId) {
		var path = grade.get('href')
				.replace(this.get('href').split(/[?#]/)[0], '')//remove the prefix
				.replace(/^\//, '')//remove the initial separator
				.split('/')//make into a list
				.map(decodeURIComponent),//decode back into normal value
			book = this.getFieldItem('Items', path[0]) || this.buildBook(path[0]),
			entry = book && (book.getFieldItem('Items', path[1]) || book.buildEntry(path[1], assignmentId));

		if (path.length > 3) {
			Ext.Error.raise('Bad PATH!' + path);
		}

		if (entry) {
			entry.addItem(grade);
		} else {
			console.warn('Coud not add built grade object to the gradebook.' + path, book, entry);
		}
	},


	buildBook: function (name) {
		var items = this.get('Items'),
			book = GradeBookPart.create({Items: {}, Name: name}),
			key = items.length;

		if (Ext.isEmpty(name)) {
			Ext.Error.raise('No name');
		}

		items.push(book);
		items.INDEX_KEYMAP[name] = key;

		this.afterEdit(['Items']);
	},


	findGradeBookEntryFor: function (assignmentId) {
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
