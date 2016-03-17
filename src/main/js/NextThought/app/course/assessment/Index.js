export default Ext.define('NextThought.app.course.assessment.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-container',

	requires: [
		'NextThought.app.course.assessment.components.View',
		'NextThought.app.course.assessment.components.Assignment',
		'NextThought.util.PageSource',
		'NextThought.util.PagedPageSource'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'card',

	title: 'Assignments',

	statics: {
		showTab: function(bundle) {
			return bundle && bundle.getWrapper && bundle.shouldShowAssignments();
		}
	},


	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/', this.showAssignments.bind(this));
		this.addRoute('/notifications', this.showNotifications.bind(this));
		this.addRoute('/performance', this.showPerformance.bind(this));

		this.addRoute('/:assignment', this.showAssignment.bind(this));
		this.addRoute('/:assignment/students', this.showStudentsForAssignment.bind(this));
		this.addRoute('/performance/:student', this.showAssignmentsForStudent.bind(this));
		this.addRoute('/performance/:student/:assignment', this.showAssignmentForStudent.bind(this));
		this.addRoute('/:assignment/students/:student', this.showStudentForAssignment.bind(this));

		this.addDefaultRoute('/');

		this.addObjectHandler(NextThought.model.assessment.Assignment.mimeType, this.getAssignmentRoute.bind(this));
		this.addObjectHandler(NextThought.model.assessment.TimedAssignment.mimeType, this.getAssignmentRoute.bind(this));

		this.add({
			xtype: 'course-assessment',
			title: this.title,
			root: this,
			changeRoute: this.changeRoute.bind(this)
		});

		this.addChildRouter(this.getView());

		this.on('deactivate', this.closeAssignment.bind(this));
	},

	getRouteStateKey: function() {
		if (this.currentBundle) {
			return this.currentBundle.getId() + '-assessment';
		}
	},

	onActivate: function() {
		this.setTitle(this.title);
	},


	closeAssignment: function() {
		var view = this.getView();

		this.getLayout().setActiveItem(view);

		if (this.assignment) {
			this.assignment.destroy();
		}
	},


	getRouteTitle: function() {
		return this.title;
	},


	getView: function() {
		return this.down('course-assessment');
	},


	bundleChanged: function(bundle) {
		var view = this.getView();

		this.currentBundle = bundle;

		return view.bundleChanged(bundle);
	},


	showReader: function(config) {
		if (this.assignment) {
			if (this.assignment.reader && this.assignment.reader.el) {
				this.assignment.reader.el.unmask();
			}

			this.assignment.destroy();
		}

		config.bundle = this.currentBundle;
		config.handleNavigation = this.handleNavigation.bind(this);

		this.assignment = this.add({
			xtype: 'course-assessment-assignment',
			readerConfig: config,
			setTitle: this.setTitle.bind(this),
			onSubmission: this.onAssignmentSubmission.bind(this)
		});

		this.addChildRouter(this.assignment);

		this.getLayout().setActiveItem(this.assignment);
	},


	onAssignmentSubmission: function(assignmentId, historyItemLink) {
		var me = this,
			view = me.getView(),
			assignmentCollection = view.assignmentCollection;

		Service.request(historyItemLink)
			.then(function(response) {
				return JSON.parse(response);
			})
			.then(function(history) {
				var reader = me.assignment,
					item = ParseUtils.parseItems(history)[0];

				if (reader && reader.updateHistory) {
					reader.updateHistory(item);
				}

				return history;
			})
			.then(assignmentCollection.updateHistoryItem.bind(assignmentCollection, assignmentId))
			.always(this.bundleChanged.bind(this, this.currentBundle));
	},


	showAssignment: function(route, subRoute) {
		var me = this,
			id = route.params.assignment,
			assignment = route.precache.assignment,
			now = new Date(),
			view = this.getView();

		id = ParseUtils.decodeFromURI(id);

		assignment = assignment || view.assignmentCollection.fetchAssignment(id);

		if (this.assignment && this.assignment.reader && this.assignment.reader.el) {
			this.assignment.reader.el.mask('Loading...');
		}

		return Promise.all([
			assignment,
			view.getAssignmentList()
		]).then(function(result) {
			var	assignment = result[0],
				assignments = result[1] || [],
				enrollment = result[2],
				assignmentStart = assignment.get('availableBeginning'),
				index, prev, next, path = [], pageSource;

			assignments.forEach(function(item, i) {
				if (item.getId() === assignment.getId()) {
					index = i;
				}
			});
			prev = index - 1;
			next = index + 1;

			if (prev >= 0) {
				prev = assignments[prev];
			} else {
				prev = undefined;
			}

			if (next < assignments.length) {
				next = assignments[next];
			} else {
				next = undefined;
			}

			path.push({
				label: 'Assignments',
				title: 'Assignments',
				route: '/'
			});

			if (view.isAdmin) {
				path.push({
					label: assignment.get('title'),
					title: assignment.get('title'),
					route: '/' + ParseUtils.encodeForURI(assignment.getId()) + '/students'
				});

				path.push({
					cls: 'locked',
					label: $AppConfig.userObject.getName()
				});
			} else {
				path.push({
					cls: 'locked',
					label: assignment.get('title')
				});
			}

			pageSource = NextThought.util.PageSource.create({
				next: next && next.getId(),
				nextTitle: next && next.get('title'),
				previous: prev && prev.getId(),
				previousTitle: prev && prev.get('title'),
				currentIndex: index,
				total: assignments.length
			});

			return {
				path: path,
				pageSource: pageSource,
				assignment: assignment,
				student: $AppConfig.userObject,
				assignmentHistory: view.assignmentCollection.getHistoryItem(assignment.getId(), true),
				instructorProspective: view.isAdmin,
				fragment: route.hash
			};
		})
		.then(me.showReader.bind(me))
		.then(function() {
			if (me.assignment && me.assignment.reader && me.assignment.reader.el) {
				me.assignment.reader.el.unmask();
			}
		});
	},


	showAssignments: function(route, subRoute) {
		var view = this.getView();

		this.getLayout().setActiveItem(view);

		this.closeAssignment();

		return view.showAssignments(route, subRoute);
	},


	showNotifications: function(route, subRoute) {
		var view = this.getView();

		this.getLayout().setActiveItem(view);

		this.closeAssignment();

		return view.showNotifications(route, subRoute);
	},


	showPerformance: function(route, subRoute) {
		var view = this.getView();

		this.getLayout().setActiveItem(view);

		this.closeAssignment();

		return view.showPerformance(route, subRoute);
	},


	showStudentsForAssignment: function(route, subRoute) {
		var view = this.getView();

		this.getLayout().setActiveItem(view);

		this.closeAssignment();

		return view.showStudentsForAssignment(route, subRoute);
	},


	showAssignmentsForStudent: function(route, subRoute) {
		var view = this.getView();

		this.getLayout().setActiveItem(view);

		this.closeAssignment();

		return view.showAssignmentsForStudent(route, subRoute);
	},


	__getHistoryItem: function(historyItem) {
		var link = historyItem && historyItem.getLink('UsersCourseAssignmentHistoryItem'),
			load;

		if (link && historyItem.isSummary) {
			load = Service.request(link)
				.then(function(json) {
					var o = ParseUtils.parseItems(json)[0];

					historyItem.set({
						Feedback: o.get('Feedback'),
						Submission: o.get('Submission'),
						pendingAssessment: o.get('pendingAssessment'),
						Grade: o.get('Grade')
					});

					delete historyItem.isSummary;

					return historyItem;
				});
		} else {
			load = Promise.resolve(historyItem);
		}

		return load;
	},


	showStudentForAssignment: function(route, subRoute) {
		var me = this,
			view = this.getView(),
			assignmentId = route.params.assignment,
			studentId = route.params.student,
			assignment = route.precache.assignment,
			student = route.precache.student;


		if (me.assignment && me.assignment.reader && me.assignment.reader.el) {
			me.assignment.reader.el.mask('Loading...');
		} else {
			view.maybeMask();
		}

		assignmentId = ParseUtils.decodeFromURI(assignmentId);
		studentId = NextThought.model.User.getIdFromURIPart(studentId);

		assignment = assignment && assignment.getId() === assignmentId ? assignment : view.assignmentCollection.getItem(assignmentId);
		student = student && student.getId() === studentId ? student : UserRepository.getUser(studentId);

		return Promise.all([
				assignment,
				student
			])
			.then(function(results) {
				assignment = results[0];
				student = results[1];

				return view.getStudentListForAssignment(assignment, student.get('Username'));
			})
			.then(function(students) {
				var record, pageSource, path = [],
					historyItem, link, load,
					current = students.findBy(function(rec) {
						var user = rec.get('User');

						return studentId === user.getId();
					});

				if (current < 0) {
					console.error('Unable to get record for student');
					me.replaceRoute('Assignments', '/');
					return Promise.reject();
				}

				record = students.getAt(current);

				historyItem = record && record.get('HistoryItemSummary');

				link = historyItem.getLink('UsersCourseAssignmentHistoryItem');

				if (link && historyItem.isSummary) {
					load = Service.request(link)
						.then(function(json) {
							var o = ParseUtils.parseItems(json)[0];

							historyItem.set({
								Feedback: o.get('Feedback'),
								Submission: o.get('Submission'),
								pendingAssessment: o.get('pendingAssessment'),
								Grade: o.get('Grade')
							});

							delete historyItem.isSummary;

							return historyItem;
						});
				} else {
					load = Promise.resolve(historyItem);
				}

				pageSource = NextThought.util.PagedPageSource.create({
					store: students,
					currentIndex: current,
					getTitle: function(rec) {
						return rec ? rec.get('Alias') : '';
					},
					getRoute: function(rec) {
						if (!rec) { return ''; }

						var user = rec.get('User'),
							id = user.getURLPart();

						return ParseUtils.encodeForURI(assignmentId) + '/students/' + id;
					},
					fillInRecord: function(item) {
						var user = item.get('User');

						if (!user) {
							return item;
						}

						return UserRepository.getUser(user.Username || user)
							.then(function(u) {
								item.set('User', u);

								return item;
							});
					}
				});

				path.push({
					label: 'Assignments',
					title: 'Assignments',
					route: '/'
				});

				path.push({
					label: assignment.get('title'),
					title: assignment.get('title'),
					route: '/' + ParseUtils.encodeForURI(assignment.getId()) + '/students',
					precache: {
						student: student
					}
				});

				path.push({
					label: student.getName()
				});

				return {
					path: path,
					pageSource: pageSource.load(),
					assignment: assignment,
					student: student,
					assignmentHistory: load
				};
			})
			.then(me.showReader.bind(me))
			.always(function() {
				if (me.assignment && me.assignment.reader && me.assignment.reader.el) {
					me.assignment.reader.el.unmask();
				}

				view.maybeUnmask();
			});
	},


	showAssignmentForStudent: function(route, subRoute) {
		var me = this,
			view = this.getView(),
			assignmentId = route.params.assignment,
			studentId = route.params.student,
			assignment = route.precache.assignment,
			student = route.precache.student;

		if (me.assignment && me.assignment.reader && me.assignment.reader.el) {
			me.assignment.reader.el.mask('Loading...');
		} else {
			view.maybeMask();
		}

		assignmentId = ParseUtils.decodeFromURI(assignmentId);
		studentId = NextThought.model.User.getIdFromURIPart(studentId);

		assignment = assignment && assignment.getId() === assignmentId ? assignment : view.assignmentCollection.getItem(assignmentId);
		student = student && student.getId() === studentId ? student : UserRepository.getUser(studentId);

		return Promise.all([
				assignment,
				student
			])
			.then(function(results) {
				assignment = results[0];
				student = results[1];

				return view.getAssignmentListForStudent(student.get('Username'));
			})
			.then(function(assignments) {
				var record, pageSource, path = [], next, previous,
					current = assignments.findBy(function(rec) {
						return rec.get('AssignmentId') === assignment.getId();
					});

				if (current < 0) {
					console.error('Failed to find assignment');
					me.pushRoute('Grades & Performance', '/performance');
					return Promise.reject();
				}

				record = assignments.getAt(current);

				pageSource = NextThought.util.PagedPageSource.create({
					store: assignments,
					currentIndex: current,
					getTitle: function(rec) {
						if (!rec) { return ''; }

						var id = rec.get('AssignmentId'),
							assignment = view.assignmentCollection.getItem(id);

						if (assignment) {
							return assignment.get('title');
						}
					},
					getRoute: function(rec) {
						if (!rec) { return ''; }

						var id = rec.get('AssignmentId');

						id = ParseUtils.encodeForURI(id);

						return 'performance/' + studentId + '/' + id;
					}
				});

				path.push({
					label: 'Grades & Performance',
					title: 'Grades & Performance',
					route: '/performance',
					precache: {
						student: student
					}
				});

				path.push({
					label: student.getName(),
					title: student.getName(),
					route: '/performance/' + student.getURLPart()
				});

				path.push({
					label: assignment.get('title')
				});


				return {
					path: path,
					pageSource: pageSource.load(),
					assignment: assignment,
					assignmentHistory: me.__getHistoryItem(record),
					student: student
				};
			})
			.then(me.showReader.bind(me))
			.always(function() {
				if (me.assignment && me.assignment.reader && me.assignment.reader.el) {
					me.assignment.reader.el.unmask();
				}

				view.maybeUnmask();
			});
	},


	onRoute: function(route, subRoute) {
		var view = this.getView();

		this.getLayout().setActiveItem(view);

		return view.handleRoute(route.path, route.precache);
	},


	getAssignmentRoute: function(obj) {
		var id = obj.getId();

		id = ParseUtils.encodeForURI(id);

		return {
			route: id,
			title: obj.get('title'),
			precache: {
				assignment: obj
			}
		};
	},


	changeRoute: function(title, route, precache) {
		this.pushRoute(title, route || '/', precache);
	},


	handleNavigation: function(title, route, precache) {
		this.pushRoute(title, route, precache);
	},


	getRouteForPath: function(path, assignment) {
		var assignmentId = assignment.getId(),
			root = path[0],
			route;

		assignmentId = ParseUtils.encodeForURI(assignmentId);

		route = '/' + assignmentId;

		if (root instanceof NextThought.model.courseware.UsersCourseAssignmentHistoryItemFeedback) {
			route += '#feedback';
		}

		return {
			path: route,
			isFull: true
		};
	}
});
