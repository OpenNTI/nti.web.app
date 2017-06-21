const Ext = require('extjs');

require('../Base');
require('./Grade');
require('./UsersCourseAssignmentHistoryItemFeedback');
require('./UsersCourseAssignmentHistoryItemFeedbackContainer');



module.exports = exports = Ext.define('NextThought.model.courseware.UsersCourseAssignmentHistory', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.assessment.userscourseassignmenthistory',

	fields: [
		{name: 'UsersCourseAssignmentHistory', type: 'auto'},
		{name: 'Items', type: 'collectionItem', persist: false},
		{name: 'lastViewed', type: 'date', dateFormat: 'timestamp'}
	],

	getItem: function (id) {
		return this.getFieldItem('Items', id);
	},

	addItem: function (key, item) {
		var items = this.get('Items'),
			index = items.length;

		items.push(item);
		items.INDEX_KEYMAP[key] = index;
	},

	statics: {
		getEmpty: function () {
			var e = this.create({lastViewed: new Date()});
			e.getItem = Ext.emptyFn;
			return e;
		}
	}
});
