const Ext = require('@nti/extjs');

require('../Base');

module.exports = exports = Ext.define('NextThought.model.courseware.UsersCourseAssignmentHistoryItemContainer', {
	extend: 'NextThought.model.Base',

	mimeType: [
		'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemcontainer'
	],


	fields: [
		{name: 'Items', type: 'collectionItem', persist: false},

		//set by the store when it loads
		{name: 'AssignmentId', type: 'string', persit: false},
	],


	getHistoryItem () {
		return this.get('Items') && this.getFieldItem('Items', 'UsersCourseAssignmentHistoryItem');
	}
});
