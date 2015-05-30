Ext.define('NextThought.app.course.assessment.Index', {
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
			if (!bundle || !bundle.getWrapper || !bundle.shouldShowAssignments()) {
				return false;
			}

			return true;
		}
	},

	items: [
		{xtype: 'box', autoEl: {html: 'assessment'}}
	],


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


	onActivate: function() {
		this.setTitle(this.title);
	},


	closeAssignment: function() {
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

		this.getLayout().setActiveItem(this.assignment);
	},


	onAssignmentSubmission: function(assignmentId, historyItemLink) {
		var view = this.getView(),
			assignmentCollection = view.assignmentCollection;

		Service.request(historyItemLink)
			.then(function(response) {
				return JSON.parse(response);
			})
			.then(assignmentCollection.updateHistoryItem.bind(assignmentCollection, assignmentId))
			.always(this.bundleChanged.bind(this, this.currentBundle));
	},


	showAssignment: function(route, subRoute) {
		var me = this,
			id = route.params.assignment,
			assignment = route.precache.assignment,
			view = this.getView();

		id = ParseUtils.decodeFromURI(id);

		assignment = assignment || Service.getObject(id);

		if (this.assignment && this.assignment.reader && this.assignment.reader.el) {
			this.assignment.reader.el.mask('Loading...');
		}

		return Promise.all([
			assignment,
			view.getAssignmentList()
		]).then(function(result) {
			var	assignment = result[0],
				assignments = result[1] || [],
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

			path.push({
				cls: 'locked',
				label: assignment.get('title')
			});

			pageSource = NextThought.util.PageSource.create({
				next: next && next.getId(),
				nextTitle: next && next.get('title'),
				previous: prev && prev.getId(),
				previousTitle: prev && prev.get('title'),
				currentIndex: index + 1,
				total: assignments.length
			});

			return {
				path: path,
				pageSource: pageSource,
				assignment: assignment,
				student: $AppConfig.userObject,
				assignmentHistory: view.assignmentCollection.getHistoryItem(assignment.getId(), true)
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

		this.closeAssignment();

		this.getLayout().setActiveItem(view);

		return view.showAssignments(route, subRoute);
	},


	showNotifications: function(route, subRoute) {
		var view = this.getView();

		this.closeAssignment();

		this.getLayout().setActiveItem(view);

		return view.showNotifications(route, subRoute);
	},


	showPerformance: function(route, subRoute) {
		var view = this.getView();

		this.closeAssignment();

		this.getLayout().setActiveItem(view);

		return view.showPerformance(route, subRoute);
	},


	showStudentsForAssignment: function(route, subRoute) {
		var view = this.getView();

		this.closeAssignment();

		this.getLayout().setActiveItem(view);

		return view.showStudentsForAssignment(route, subRoute);
	},


	showAssignmentsForStudent: function(route, subRoute) {
		var view = this.getView();

		this.closeAssignment();

		this.getLayout().setActiveItem(view);

		return view.showAssignmentsForStudent(route, subRoute);
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
		}

		assignmentId = ParseUtils.decodeFromURI(assignmentId);
		studentId = NextThought.model.User.getIdFromURIPart(studentId);

		assignment = assignment && assignment.getId() === assignmentId ? assignment : Service.getObject(assignmentId);
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

				link = historyItem.getLink('UserCourseAssignmentHistoryItem');

				if (link && history.isSummary) {
					load = Service.getLink(link)
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
					current: current,
					getTitle: function(rec) {
						return rec ? rec.get('Alias') : '';
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
					route: '/' + ParseUtils.encodeForURI(assignment.getId())
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
			});
	},


	showAssignmentForStudent: function(route, subRoute) {},


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


	handleNavigation: function(title, ntiidOrRoute) {
		var route = ntiidOrRoute;

		if (ParseUtils.isNTIID(route)) {
			route = ParseUtils.encodeForURI(route);
		}

		this.pushRoute(title, route);
	}
});
