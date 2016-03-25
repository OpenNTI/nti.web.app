var Ext = require('extjs');
var ModelBase = require('../Base');


module.exports = exports = Ext.define('NextThought.model.courseware.UsersCourseAssignmentHistoryItemFeedbackContainer', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedbackcontainer',

	fields: [
		{name: 'Items', type: 'arrayItem', persist: false}
	],

	getCount: function () {
		return (this.get('Items') || []).length;
	}
});
