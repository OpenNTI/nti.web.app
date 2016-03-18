var Ext = require('extjs');
var ModelBase = require('../Base');
var AssignmentsStudentCollection = require('./assignments/StudentCollection');
var AssignmentsInstructorCollection = require('./assignments/InstructorCollection');


module.exports = exports = Ext.define('NextThought.model.courses.AssignmentCollection', {
    extend: 'NextThought.model.Base',

    statics: {
		fromJson: function(assignments, nonAssignments, gradeBook, historyURL, isAdmin) {
			var collection;

			if (isAdmin) {
				collection = NextThought.model.courses.assignments.InstructorCollection;
			} else {
				collection = NextThought.model.courses.assignments.StudentCollection;
			}

			return collection.fromJson.apply(collection, arguments);
		}
	}
});
