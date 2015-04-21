Ext.define('NextThought.model.courses.AssignmentCollection', {
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.model.courses.assignments.StudentCollection',
		'NextThought.model.courses.assignments.InstructorCollection'
	],


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
