Ext.define('NextThought.view.courseware.dashboard.widgets.Assignments', {
	extend: 'NextThought.view.courseware.dashboard.widgets.Base',

	requires: ['NextThought.view.courseware.dashboard.tiles.Assignment'],

	statics: {
		getTiles: function(course, startDate, endDate, isNow) {
			var start = moment(startDate),
				end = moment(endDate);

			function getCmpConfig(assignment) {
				return {
					xtype: 'dashboard-assignment',
					record: assignment
				};
			}

			return course.getAssignments()
						.then(function(assignmentCollection) {
							var assignments = [];

							assignmentCollection.each(function(assignment) {
								var assignmentStart = assignment.get('availableBeginning'),
									assignmentEnd = assignment.get('availableEnding');

								//if we are building for the current week
								if (isNow) {
									//if the assignment starts before the end of the week
									//and the assignment hasn't ended before the start of the week
									if (end.isAfter(assignmentStart) && start.isBefore(assignmentEnd)) {
										assignments.push(getCmpConfig(assignment));
									}
								//else if the assignment has ended this week
								} else if (end.isAfter(assignmentEnd) && start.isBefore(assignmentEnd)) {
									assignments.push(getCmpConfig(assignment));
								}
							});

							return assignments;
						});
		}
	}
});
