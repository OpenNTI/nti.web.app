const Ext = require('extjs');

const StudentCollection = require('./assignments/StudentCollection');
const InstructorCollection = require('./assignments/InstructorCollection');

require('../Base');


module.exports = exports = Ext.define('NextThought.model.courses.AssignmentCollection', {
	extend: 'NextThought.model.Base',

	statics: {
		fromJson: function (assignments, nonAssignments, gradeBook, historyURL, isAdmin) {
			var collection;

			if (isAdmin) {
				collection = InstructorCollection;
			} else {
				collection = StudentCollection;
			}

			return collection.fromJson.apply(collection, arguments);
		}
	}
});
