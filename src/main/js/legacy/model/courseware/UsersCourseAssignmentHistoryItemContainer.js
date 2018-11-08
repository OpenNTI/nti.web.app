const Ext = require('@nti/extjs');

require('../Base');

module.exports = exports = Ext.define('NextThought.model.courseware.UsersCourseAssignmentHistoryItemContainer', {
	extend: 'NextThought.model.Base',

	mimeType: [
		'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemcontainer'
	],


	fields: [
		{name: 'Items', type: 'arrayItem', persist: false},

		//set by the store when it loads
		{name: 'item', type: 'auto', persist: false},
		{name: 'AssignmentId', type: 'string', persist: false},
	],


	getMostRecentHistoryItem () {
		const items = this.get('Items');

		return items && items[items.length - 1];
	}
});
