const Ext = require('extjs');
const path = require('path');
const UserRepository = require('../../../cache/UserRepository');
const ParseUtils = require('../../../util/Parsing');
const { encodeForURI, decodeFromURI } = require('nti-lib-ntiids');

require('../../../mixins/Router');
require('./components/View');
require('./components/Assignment');
require('./components/editing/AssignmentEditor');
require('../../../util/PageSource');
require('../../../util/PagedPageSource');


module.exports = exports = Ext.define('NextThought.app.course.assessment.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-container',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'card',
	title: 'Assignments',

	statics: {
		showTab: function (bundle) {
			return bundle && bundle.getWrapper && bundle.shouldShowAssignments();
		}
	},


	initComponent: function () {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/', this.showAssignments.bind(this));
		this.addRoute('/notifications', this.showNotifications.bind(this));
		this.addRoute('/performance', this.showPerformance.bind(this));

		this.addRoute('/:assignment', this.showAssignment.bind(this));
		this.addRoute('/:assignment/edit', this.editAssignment.bind(this));
		this.addRoute('/:assignment/students', this.showStudentsForAssignment.bind(this));
		this.addRoute('/performance/:student', this.showAssignmentsForStudent.bind(this));
		this.addRoute('/performance/:student/:assignment', this.showAssignmentForStudent.bind(this));
		this.addRoute('/:assignment/students/:student', this.showStudentForAssignment.bind(this));

		this.addDefaultRoute('/');

		this.addObjectHandler(NextThought.model.assessment.Assignment.mimeType, this.getAssignmentRoute.bind(this));

		this.add({
			xtype: 'course-assessment',
			title: this.title,
			root: this,
			changeRoute: this.changeRoute.bind(this)
		});

		this.addChildRouter(this.getView());

		this.on('deactivate', this.closeAssignment.bind(this));
	},


	getRouteStateKey: function () {
		if (this.currentBundle) {
			return this.currentBundle.getId() + '-assessment';
		}
	},


	onRouteActivate () {
		const active = this.getLayout().getActiveItem();

		if (active && active.onRouteActivate) {
			active.onRouteActivate();
		}
	},


	onRouteDeactivate () {
		const active = this.getLayout().getActiveItem();

		if (active && active.onRouteDeactivate) {
			active.onRouteDeactivate();
		}
	},

	onActivate: function () {
		this.setTitle(this.title);
	},


	closeAssignment: function () {
		var view = this.getView();

		this.getLayout().setActiveItem(view);

		if (this.assignment) {
			this.assignment.destroy();
		}
	},


	getRouteTitle: function () {
		return this.title;
	},


	getView: function () {
		return this.down('course-assessment');
	},


	bundleChanged: function (bundle) {
		var view = this.getView();

		this.currentBundle = bundle;

		return view.bundleChanged(bundle);
	},


	showReader: function (config) {
		if (this.assignment) {
			if (this.assignment.reader && this.assignment.reader.el) {
				this.assignment.reader.el.unmask();
			}

			this.assignment.destroy();
		}

		if (this.assignmentEditor) {
			this.assignmentEditor.destroy();
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


	showEditor (config) {
		if (this.assignment) {
			this.assignment.destroy();
			delete this.assigmment;
		}

		this.assignmentEditor = this.add({
			xtype: 'assignment-editor',
			assignmentId: config.assignmentId,
			assignments: config.assignments,
			pageSource: config.pageSource,
			assignment: config.assignment,
			gotoAssignments: () => {
				this.pushRoute('Assignments', '/');
			},
			gotoAssignment: (NTIID, title) => {
				this.pushRoute(title, path.join(encodeForURI(NTIID), 'edit'));
			},
			previewAssignment: (NTIID, title) => {
				this.pushRoute(title, path.join(encodeForURI(NTIID)));
			},
			findAssignment: (NTIID) => {
				const view = this.getView();
				const assignments = view && view.assignmentCollection;

				if (assignments) {
					return assignments.findItem(NTIID);
				}

				return null;
			}

		});

		this.addChildRouter(this.assignmentEditor);

		this.getLayout().setActiveItem(this.assignmentEditor);
	},


	onAssignmentSubmission: function (assignmentId, historyItemLink) {
		var me = this,
			view = me.getView(),
			assignmentCollection = view.assignmentCollection;

		Service.request(historyItemLink)
			.then(function (response) {
				return JSON.parse(response);
			})
			.then(function (history) {
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


	showAssignment: function (route, subRoute) {
		var me = this,
			id = route.params.assignment,
			assignment = route.precache.assignment,
			now = new Date(),
			view = this.getView();

		id = decodeFromURI(id);

		assignment = assignment || view.assignmentCollection.fetchAssignment(id);

		if (this.assignment && this.assignment.reader && this.assignment.reader.el) {
			this.assignment.reader.el.mask('Loading...');
		}

		return Promise.all([
			assignment,
			view.getAssignmentList()
		]).then(function (result) {
			var assignment = result[0],
				assignments = result[1] || [],
				enrollment = result[2],
				assignmentStart = assignment.get('availableBeginning'),
				index, prev, next, path = [], pageSource;

			assignments.forEach(function (item, i) {
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
					route: '/' + encodeForURI(assignment.getId()) + '/students'
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
				total: assignments.length,
				getRoute: function (id) {
					return id && encodeForURI(id);
				}
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
		.then(function () {
			if (me.assignment && me.assignment.reader && me.assignment.reader.el) {
				me.assignment.reader.el.unmask();
			}
		});
	},


	editAssignment (route, subRoute) {
		//TODO: pass more info about paging and bread crumbs and what not
		const id = decodeFromURI(route.params.assignment);
		const view = this.getView();

		return view.getAssignmentList()
			.then((assignments) => {
				let index = 0;
				let prev = 0;
				let next = 0;
				let assignment;

				for (index; index < assignments.length; index++) {
					let item = assignments[index];

					if (item.getId() === id) {
						assignment = item;
						break;
					}
				}

				prev = index - 1;
				next = index + 1;

				if (prev >= 0) {
					prev = assignments[prev];
				} else {
					prev = null;
				}

				if (next < assignments.length) {
					next = assignments[next];
				} else {
					next = null;
				}

				let pageSource = {
					next: next && next.getId(),
					nextTitle: next && next.get('title'),
					previous: prev && prev.getId(),
					previousTitle: prev && prev.get('title'),
					currentIndex: index,
					total: assignments.length
				};

				return {
					assignmentId: id,
					assignment: assignment || (route.precache || {}).assignment,
					pageSource
				};
			})
			.then(cfg => this.showEditor(cfg));

		// this.showEditor({
		// 	assignmentId: decodeFromURI(route.params.assignment)
		// });

		// return Promise.resolve();
	},


	showAssignments: function (route, subRoute) {
		var view = this.getView();

		this.getLayout().setActiveItem(view);

		this.closeAssignment();

		return view.showAssignments(route, subRoute);
	},


	showNotifications: function (route, subRoute) {
		var view = this.getView();

		this.getLayout().setActiveItem(view);

		this.closeAssignment();

		return view.showNotifications(route, subRoute);
	},


	showPerformance: function (route, subRoute) {
		var view = this.getView();

		this.getLayout().setActiveItem(view);

		this.closeAssignment();

		return view.showPerformance(route, subRoute);
	},


	showStudentsForAssignment: function (route, subRoute) {
		var view = this.getView();

		this.getLayout().setActiveItem(view);

		this.closeAssignment();

		return view.showStudentsForAssignment(route, subRoute);
	},


	showAssignmentsForStudent: function (route, subRoute) {
		var view = this.getView();

		this.getLayout().setActiveItem(view);

		this.closeAssignment();

		return view.showAssignmentsForStudent(route, subRoute);
	},


	__getHistoryItem: function (historyItem) {
		var link = historyItem && historyItem.getLink('UsersCourseAssignmentHistoryItem'),
			load;

		if (link && historyItem.isSummary) {
			load = Service.request(link)
				.then(function (json) {
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


	showStudentForAssignment: function (route, subRoute) {
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

		assignmentId = decodeFromURI(assignmentId);
		studentId = NextThought.model.User.getIdFromURIPart(studentId);

		assignment = assignment && assignment.getId() === assignmentId ? assignment : view.assignmentCollection.getItem(assignmentId);
		student = student && student.getId() === studentId ? student : UserRepository.getUser(studentId);

		return Promise.all([
			assignment,
			student
		])
			.then(function (results) {
				assignment = results[0];
				student = results[1];

				return view.getStudentListForAssignment(assignment, student.get('Username'));
			})
			.then(function (students) {
				const params = students.proxy.extraParams || {};
				var record, pageSource, path = [],
					historyItem, link, load,
					current = students.findBy(function (rec) {
						var user = rec.get('User');

						return studentId === user.getId();
					});

				if (current < 0) {
					// NOTE: When we can't find a student record,
					// it's possible they are on the next/previous page.
					// Use the batchContainingUsernameFilterByScope to load
					// the page with that record.
					if (!params.batchContainingUsernameFilterByScope) {
						params.batchContainingUsernameFilterByScope = studentId;

						students.on({
							load: () => me.showStudentForAssignment(route, subRoute),
							single: true
						});

						students.load();
						return Promise.reject();
					}
					else {
						console.error('Unable to get record for student');
						delete params.batchContainingUsernameFilterByScope;

						// Go back to the assignments list.
						me.replaceRoute('Assignments', '/');
						return Promise.reject();
					}
				}

				// Cleanup
				delete params.batchContainingUsernameFilterByScope;
				record = students.getAt(current);

				historyItem = record && record.get('HistoryItemSummary');

				link = historyItem && historyItem.getLink('UsersCourseAssignmentHistoryItem');

				if (link && historyItem.isSummary) {
					load = Service.request(link)
						.then(function (json) {
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
					getTitle: function (rec) {
						return rec ? rec.get('Alias') : '';
					},
					getRoute: function (rec) {
						if (!rec) { return ''; }

						var user = rec.get('User'),
							id = user.getURLPart();

						return encodeForURI(assignmentId) + '/students/' + id;
					},
					fillInRecord: function (item) {
						var user = item.get('User');

						if (!user) {
							return item;
						}

						return UserRepository.getUser(user.Username || user)
							.then(function (u) {
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
					route: '/' + encodeForURI(assignment.getId()) + '/students',
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
			.always(function () {
				if (me.assignment && me.assignment.reader && me.assignment.reader.el) {
					me.assignment.reader.el.unmask();
				}

				view.maybeUnmask();
			});
	},


	showAssignmentForStudent: function (route, subRoute) {
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

		assignmentId = decodeFromURI(assignmentId);
		studentId = NextThought.model.User.getIdFromURIPart(studentId);

		assignment = assignment && assignment.getId() === assignmentId ? assignment : view.assignmentCollection.getItem(assignmentId);
		student = student && student.getId() === studentId ? student : UserRepository.getUser(studentId);

		return Promise.all([
			assignment,
			student
		])
			.then(function (results) {
				assignment = results[0];
				student = results[1];

				return view.getAssignmentListForStudent(student.get('Username'));
			})
			.then(function (assignments) {
				var record, pageSource, path = [], next, previous,
					current = assignments.findBy(function (rec) {
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
					getTitle: function (rec) {
						if (!rec) { return ''; }

						var id = rec.get('AssignmentId'),
							assignment = view.assignmentCollection.getItem(id);

						if (assignment) {
							return assignment.get('title');
						}
					},
					getRoute: function (rec) {
						if (!rec) { return ''; }

						var id = rec.get('AssignmentId');

						id = encodeForURI(id);

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
			.always(function () {
				if (me.assignment && me.assignment.reader && me.assignment.reader.el) {
					me.assignment.reader.el.unmask();
				}

				view.maybeUnmask();
			});
	},


	onRoute: function (route, subRoute) {
		var view = this.getView();

		this.getLayout().setActiveItem(view);

		return view.handleRoute(route.path, route.precache);
	},


	getAssignmentRoute: function (obj) {
		var id = obj.getId();

		id = encodeForURI(id);

		return {
			route: id,
			title: obj.get('title'),
			precache: {
				assignment: obj
			}
		};
	},


	changeRoute: function (title, route, precache) {
		this.pushRoute(title, route || '/', precache);
	},

	handleNavigation: function (title, route, precache, replace) {
		if (replace) {
			this.replaceRoute(title, route, precache);
		} else {
			this.pushRoute(title, route, precache);
		}
	},


	getRouteForPath: function (path, assignment) {
		var assignmentId = assignment.getId(),
			root = path[0],
			route;

		assignmentId = encodeForURI(assignmentId);

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
