var Ext = require('extjs');
var ModelBase = require('../Base');
var ConvertersDate = require('../converters/Date');


module.exports = exports = Ext.define('NextThought.model.courseware.GradeBookEntry', {
    extend: 'NextThought.model.Base',
    mimeType: 'application/vnd.nextthought.gradebookentry',

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

		if (Ext.isEmpty(rec.get('Username'))) {
			Ext.Error.raise('No Username');
		}

		items.push(rec);
		items.INDEX_KEYMAP[rec.get('Username')] = key;
		this.afterEdit(['Items']);
	},

    updateHistoryItem: function(item) {
		var c = item.get('Creator'),
			u = typeof c === 'string' ? c : c.getId(),
			submissionGrade = item.get('Grade'),
			gradebookGrade = this.getFieldItem('Items', u);

		if (!gradebookGrade) {
			return;
		}

		if (submissionGrade && submissionGrade.get('Username') !== u) {
			console.warn('Record creator does not match username of its own grade object', item);
		}

		if (gradebookGrade.get('Username') !== u) {
			console.error('Record creator does not match username of the grade object from the GradeBook entry', item, u, this);
			return;
		}

		item.set('Grade', gradebookGrade);
	}
});
