const { isAfter, isBefore } = require('date-fns');

const Ext = require('@nti/extjs');

const TilesAssignment = require('../tiles/Assignment');

const WidgetsBase = require('./Base');

module.exports = exports = Ext.define(
	'NextThought.app.course.dashboard.components.widgets.Assignments',
	{
		extend: 'NextThought.app.course.dashboard.components.widgets.Base',

		statics: {
			__BASE_WEIGHT: 2,

			MAX_NOT_DUE: 5,

			__TIME_MODIFIER: 0.1,

			getWeight: function (record) {
				const lorentzian = x => 1 / (Math.pow(x - 1, 2) + 1);

				var time = WidgetsBase.getTimeWeight(
					record.get('availableEnding'),
					lorentzian
				);

				return this.__BASE_WEIGHT + time;
			},

			getTiles: function (course, startDate, endDate, isNow) {
				var maxNotDue = 5,
					getWeight = this.getWeight.bind(this);

				function getCmpConfig(assignment, assignments) {
					var getConfig = TilesAssignment.getTileConfig(assignment);

					return getConfig.then(function (config) {
						config.record = assignment;
						config.weight = getWeight(assignment);
						config.course = course;
						//TODO: get rid of getAssignmentHistory
						config.getAssignmentHistory =
							assignments.getHistoryItem(
								assignment.getId(),
								true
							);

						return config;
					});
				}

				return course
					.getAssignments()
					.then(function (assignmentCollection) {
						return assignmentCollection.updateAssignments();
					})
					.then(function (assignmentCollection) {
						var assignments = [];

						assignmentCollection.each(function (assignment) {
							var assignmentStart =
									assignment.get('availableBeginning'),
								assignmentEnd =
									assignment.get('availableEnding');

							//don't show the final grade assignment
							if (
								assignmentCollection.isFinalGradeAssignment(
									assignment
								)
							) {
								return;
							}

							//if we are building for the current week
							if (isNow) {
								//if the assignment starts before the end of the week
								//and the assignment hasn't ended before the start of the week
								if (
									isAfter(assignmentStart, endDate) &&
									isBefore(assignmentEnd, startDate)
								) {
									assignments.push(
										getCmpConfig(
											assignment,
											assignmentCollection
										)
									);
								}
								//else if the assignment has ended this week
							} else if (
								isAfter(assignmentEnd, endDate) &&
								isBefore(assignmentEnd, startDate)
							) {
								assignments.push(
									getCmpConfig(
										assignment,
										assignmentCollection
									)
								);
							}
						});

						return Promise.all(assignments);
					})
					.then(function (tiles) {
						if (!isNow) {
							return tiles.reverse();
						}

						tiles.sort(function (a, b) {
							var wA = a.record.get('availableEnding'),
								wB = b.record.get('availableEnding');

							return wA < wB ? -1 : wA === wB ? 0 : 1;
						});

						return tiles.slice(0, maxNotDue).reverse();
					});
			},

			UPCOMING_DAYS_CUTOFF: 10,

			getUpcomingTiles: function (course, date) {
				var load,
					upcomingCutoff = this.UPCOMING_DAYS_CUTOFF;

				console.log(upcomingCutoff);

				load = course
					.getAssignments()
					.then(function (assignmentCollection) {
						var items = Ext.clone(
								assignmentCollection.get('Items')
							),
							notPastDue;

						items = items || [];

						notPastDue = items.filter(function (item) {
							var due = item.get('availableEnding');
							// var start = item.get('availableBeginning');

							// console.log(start);

							//if we don't have due date or due is before now
							return due ? isAfter(due, date) : false;
						});

						notPastDue.sort(function (a, b) {
							var dA = a.get('availableEnding'),
								dB = b.get('availableEnding');

							return dA < dB ? -1 : dA === dB ? 0 : 1;
						});

						return notPastDue.slice(0, 3);
					});

				return Promise.resolve([
					{
						xtype: 'dashboard-assignment-list',
						load: load,
					},
				]);
			},
		},
	}
);
