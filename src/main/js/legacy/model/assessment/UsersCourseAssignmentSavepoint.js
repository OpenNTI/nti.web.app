const Ext = require('@nti/extjs');

require('../Base');
require('./UsersCourseAssignmentSavepointItem');


module.exports = exports = Ext.define('NextThought.model.assessment.UsersCourseAssignmentSavepoint', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Items', type: 'collectionItem'}
	],

	getSavePoint: function (assignmentId) {
		return this.getFieldItem('Items', assignmentId);
	}
});
