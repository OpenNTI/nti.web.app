var Ext = require('extjs');
var ModelBase = require('../Base');
var AssessmentUsersCourseAssignmentSavepointItem = require('./UsersCourseAssignmentSavepointItem');


module.exports = exports = Ext.define('NextThought.model.assessment.UsersCourseAssignmentSavepoint', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Items', type: 'collectionItem'}
	],

	getSavePoint: function (assignmentId) {
		return this.getFieldItem('Items', assignmentId);
	}
});
