const Ext = require('@nti/extjs');

require('../Base');

module.exports = exports = Ext.define('NextThought.model.courseware.UsersCourseAssignmentHistoryItemContainer', {
	extend: 'NextThought.model.Base',

	mimeType: [
		'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemcontainer'
	],


	fields: [
		{name: 'Items', type: 'collectionItem', persist: false}
	]
});
