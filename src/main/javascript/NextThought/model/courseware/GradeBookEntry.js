Ext.define('NextThought.model.courseware.GradeBookEntry', {
	extend: 'NextThought.model.Base',
	requires: ['NextThought.model.converters.Date'],
	fields: [
		{name: 'AssignmentId', type: 'string'},
		{name: 'DueDate', type: 'ISODate'},
		{name: 'Items', type: 'collectionItem'},
		{name: 'Name', type: 'string'},
		{name: 'displayName', type: 'string'},
		{name: 'GradeScheme', type: 'auto'},
		{name: 'order', type: 'int'}
	],

	addItem: function(rec) {
		var items = this.get('Items'),
			key = items.length;

		items.push(rec);
		items.INDEX_KEYMAP[rec.get('Username')] = key;
		this.afterEdit(['Items']);
	},

	updateHistoryItem: function(item) {
		var c = item.get('Creator'),
			u = typeof c === 'string' ? c : c.getId(),
			submissionGrade = item.get('Grade'),
			gradebookGrade = this.getFieldItem('Items', u);

		if (submissionGrade && submissionGrade.get('Username') !== u) {
			console.warn('Record creator does not match username of its own grade object', item);
		}

		if (!gradebookGrade) {
			return;
		}

		if (gradebookGrade.get('Username') !== u) {
			console.error('Record creator does not match username of the grade object from the GradeBook entry', item, u, this);
			return;
		}

		item.set('Grade', gradebookGrade);
	}
});
