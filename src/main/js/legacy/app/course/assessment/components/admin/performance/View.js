var Ext = require('extjs');
var UserRepository = require('../../../../../../cache/UserRepository');
var User = require('../../../../../../model/User');
var ParseUtils = require('../../../../../../util/Parsing');
var MixinsRouter = require('../../../../../../mixins/Router');
var PerformanceRoot = require('./Root');
var PerformanceStudent = require('./Student');
var UtilPagedPageSource = require('../../../../../../util/PagedPageSource');
var ModelUser = require('../../../../../../model/User');
var {isFeature} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.admin.performance.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'card',

	clearAssignmentsData: function () {
		var root = this.getRoot();
		if (root && root.clearState) {
			root.clearState();
		}

		this.removeAll(true);
	},

	maybeMask: function (path) {
		var activeItem = this.getLayout().getActiveItem();

		if (activeItem && activeItem.maybeMask && activeItem.path === path) {
			activeItem.maybeMask();
			return true;
		}

		return false;
	},

	maybeUnmask: function (path) {
		this.items.each(function (item) {
			if (item.maybeUnmask) {
				item.maybeUnmask();
			}
		});
	},

	setAssignmentsData: function (assignments, bundle, student) {
		//if we haven't changed bundles
		if (this.currentBundle === bundle) {
			if (student) {
				return this.getRoot().restoreStudent(this.getRouteState(), student);
			}

			return this.getRoot().restoreState(this.getRouteState());
		}

		var root = this.add({
			xtype: 'course-assessment-admin-performance-root',
			showAssignmentsForStudent: this.showAssignmentsForStudent.bind(this),
			assignments: assignments,
			pushRouteState: this.pushRouteState.bind(this),
			replaceRouteState: this.replaceRouteState.bind(this),
			student: student,
			path: 'root',
			currentBundle: bundle
		});

		this.currentBundle = bundle;
		this.assignmentsData = Ext.Array.clone(arguments);
		this.store = root.store;

		return root.restoreState(this.getRouteState());
	},

	getRoot: function () {
		return this.items.first();
	},

	getStudentView: function () {
		return this.down('course-assessment-admin-performance-student');
	},

	showRoot: function () {
		var root = this.getRoot(),
			layout = this.getLayout(),
			active = layout.getActiveItem();

		if (root !== active) {
			layout.setActiveItem(root);
			Ext.destroy(this.items.getRange(1));
		}
	},

	showStudent: function (student) {
		var me = this, current,
			record, pageSource,
			historyURL, user, view;

		//When we handle the route to show a students assignments, we tell the root
		//to load to this student, so when this calls the store will already have loaded
		//the page that contains this record.
		current = me.store.findBy(function (rec) {
			var user = rec.get('User');

			return student === NextThought.model.User.getIdFromRaw(user);
		});

		record = me.store.getAt(current);
		me.getRoot().activeGradeRecord = record;

		historyURL = record && record.getLink('AssignmentHistory');

		if (!historyURL) {
			console.error('Failed to load the student');
			return;
		}

		user = record.get('User');
		view = me.down('course-assessment-admin-performance-student');

		//if we already have a view for this student
		if (view && view.student.getId() === (user && user.getId())) {
			return view.refresh();
		} else {
			Ext.destroy(view);
		}

		pageSource = NextThought.util.PagedPageSource.create({
			currentIndex: current,
			store: me.store,
			getTitle: function (rec) {
				return rec ? rec.get('Alias') : '';
			},
			getRoute: function (rec) {
				var user = rec.get('User');

				return 'performance/' + user.getURLPart();
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

		view = me.add({
			xtype: 'course-assessment-admin-performance-student',
			student: user,
			summary: record,
			historiesURL: historyURL,
			FinalGradeHistoryItem: record.get('HistoryItemSummary'),
			predictedGrade: record.get('PredictedGrade'),
			container: me,
			pageSource: pageSource.load(),
			pushRoute: me.pushRoute.bind(me),
			path: 'student'
		});

		me.getStudentEnrollment(record)
			.then(function (enrollment) {
				if (enrollment && view.setEnrollmentData) {
					view.setEnrollmentData(enrollment);
				}
			});

		me.getLayout().setActiveItem(view);

		me.setTitle(user.getName());

		return view.setAssignmentsData.apply(view, me.assignmentsData);
	},

	getStudentEnrollment: function (studentRecord) {
		var roster = this.currentBundle && this.currentBundle.getLink('CourseEnrollmentRoster'),
			username = studentRecord && studentRecord.get('Username'),
			smallRequestURLToGetCounts = roster && !Ext.isEmpty(roster) && Ext.String.urlAppend(
					roster,
					Ext.Object.toQueryString({
						batchSize: 1,
						batchStart: 0,
						usernameSearchTerm: username
					}));

		if (!isFeature('instructor-email') || !username) { return Promise.reject(); }

		return Service.request(smallRequestURLToGetCounts)
					.then(JSON.parse)
					.then(function (obj) {
						var enrollment = obj.Items && obj.Items[0];
						return Promise.resolve(ParseUtils.parseItems(enrollment)[0]);
					});
	},

	showAssignmentsForStudent: function (student) {
		this.pushRoute(student.getName(), '/performance/' + student.getURLPart(), { student: student});
	}
});
