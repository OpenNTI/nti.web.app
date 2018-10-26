const Ext = require('@nti/extjs');

require('../Base');
require('./Grade');
const UsersCourseAssignmentHistoryItem = require('./UsersCourseAssignmentHistoryItem');
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
		const container = this.getFieldItem('Items', id);
		let item = container && container.getFieldItem('Items', 'UsersCourseAssignmentHistoryItem');

		return item || container;
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
