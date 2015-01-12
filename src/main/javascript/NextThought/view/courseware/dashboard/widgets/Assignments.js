Ext.define('NextThought.view.courseware.dashboard.widgets.Assignments', {
	extend: 'NextThought.view.courseware.dashboard.widgets.Base',

	requires: ['NextThought.view.courseware.dashboard.tiles.Assignment'],

	statics: {

		__BASE_WEIGHT: 4,

		getWeight: function(record) {
			var time = NextThought.view.courseware.dashboard.widgets.Base.getTimeWeight(record.get('availableEnding'));

			return this.__BASE_WEIGHT - time;
		},


		getTiles: function(course, startDate, endDate, isNow) {
			var start = moment(startDate),
				end = moment(endDate),
				getWeight = this.getWeight.bind(this);

			function getCmpConfig(assignment) {
				var getConfig = NextThought.view.courseware.dashboard.tiles.Assignment.getTileConfig(assignment);

				return getConfig
						.then(function(config) {
							config.record = assignment;
							config.weight = getWeight(assignment);
							config.course = course;
							config.getAssignmentHistory = course.getAssignmentHistory();

							return config;
						});
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

							return Promise.all(assignments);
						});
		},


		UPCOMING_DAYS_CUTOFF: 10,


		getUpcomingTiles: function(course, date) {
			var now = moment(date), load,
				upcomingCutoff = this.UPCOMING_DAYS_CUTOFF;

			console.log(upcomingCutoff);

			load = course.getAssignments()
						.then(function(assignmentCollection) {
							var items = Ext.clone(assignmentCollection.get('Items')),
								notPastDue;

							items = items || [];

							notPastDue = items.filter(function(item) {
								var due = item.get('availableEnding'),
									start = item.get('availableBeginning');

								console.log(start);

								//if we don't have due date or due is before now
								return due ? now.isAfter(due) : false;
							});

							notPastDue.sort(function(a, b) {
								var dA = a.get('availableEnding'),
									dB = b.get('availableEnding');

								return dA < dB ? -1 : dA === dB ? 0 : 1;
							});

							return notPastDue.slice(0, 3);
						});

			return Promise.resolve([
				{
					xtype: 'dashboard-assignment-list',
					load: load
				}
			]);
		}
	}
});
