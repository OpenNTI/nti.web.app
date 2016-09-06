var Ext = require('extjs');
var ParseUtils = require('../../../../../../util/Parsing');
var MixinsRouter = require('../../../../../../mixins/Router');
var UtilPageSource = require('../../../../../../util/PageSource');
var AssignmentsRoot = require('./Root');
var AssignmentsAssignment = require('./Assignment');
const { encodeForURI } = require('nti-lib-ntiids');

module.exports = exports = Ext.define('NextThought.app.course.assessment.components.admin.assignments.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-assignments',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	handlesAssignment: true,
	layout: 'card',

	setAssignmentsData: function (assignments) {

		var root = this.down('course-assessment-admin-assignments-root');

		if (!root) {
			root = this.add({
				xtype: 'course-assessment-admin-assignments-root',
				pushState: this.pushState,
				replaceState: this.replaceState,
				alignNavigation: this.alignNavigation.bind(this),
				showStudentsForAssignment: this.showStudentsForAssignment.bind(this),
				createAssignment: this.createAssignment && this.createAssignment.bind(this)
			});
			this.addChildRouter(root);
		}

		var p = root.setAssignmentsData.apply(root, arguments);

		this.assignments = assignments;
		this.store = root.store;

		return p;
	},

	clearAssignmentsData: function () {
		this.removeAll(true);
	},

	getRoot: function () {
		return this.items.first();
	},

	getAssignmentView: function () {
		return this.down('course-assessment-admin-assignments-item');
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

	showAssignment: function (assignment, student) {
		if (!assignment) {
			console.error('No assignment passed, showing root');
			this.showRoot();
			return;
		}

		var current = this.store.find('id', assignment.getId()),
			oldView = this.down('course-assessment-admin-assignments-item'),
			next, previous, view, same = false;

		next = this.store.getAt(current + 1);
		previous = this.store.getAt(current - 1);

		//if we already have a view for this assignment no need to create a new one
		if (oldView && oldView.assignment === assignment) {
			view = oldView;
			same = true;
		} else {
			Ext.destroy(oldView);
			view = this.add({
				xtype: 'course-assessment-admin-assignments-item',
				assignmentTitle: assignment.get('title'),
				due: assignment.get('due'),
				assignment: assignment,
				assignments: this.assignments,
				student: student,
				alignNavigation: this.alignNavigation.bind(this),
				pushRoute: this.pushRoute.bind(this),
				pushRouteState: this.pushRouteState.bind(this),
				replaceRouteState: this.replaceRouteState.bind(this),
				showStudentForAssignment: this.showStudentForAssignment.bind(this),
				pageSource: NextThought.util.PageSource.create({
					next: next && next.getId(),
					nextTitle: next && next.get('name'),
					previous: previous && previous.getId(),
					previoustitle: previous && previous.get('name'),
					currentIndex: current,
					total: this.store.getCount()
				})
			});
		}

		this.getLayout().setActiveItem(view);

		if (oldView && same) {
			oldView.refresh();
		}

		return view.restoreState(this.getRouteState(), student);
	},

	showStudentsForAssignment: function (rec) {
		var id = rec.getId();

		id = encodeForURI(id);

		this.pushRoute(rec.get('title'), id + '/students', {
			assignment: rec
		});
	},

	showStudentForAssignment: function (student, assignment, historyItem) {
		var assignmentId = assignment.getId(),
			assignmentTitle = assignment.get('title'),
			studentTitle = student.getName(),
			studentId = student.getURLPart();

		assignmentId = encodeForURI(assignmentId);

		this.pushRoute(studentTitle + ' | ' + assignmentTitle, assignmentId + '/students/' + studentId, {
			student: student,
			assignment: assignment,
			historyItem: historyItem
		});
	}
});
