Ext.define('NextThought.view.courseware.assessment.admin.performance.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance',
	requires: [
		'NextThought.view.courseware.assessment.admin.performance.Root',
		'NextThought.view.courseware.assessment.admin.performance.Student',
		'NextThought.proxy.courseware.PagedPageSource'
	],

	layout: 'card',
	onAdd: function(item) { this.getLayout().setActiveItem(item); },


	initComponent: function() {
		this.callParent(arguments);

		this.enableBubble('close-reader');
	},


	restoreState: function(state, active) {
		var me = this,
			root = me.getRoot();

		return root.restoreState(state)
			.then(function() {
				var record;

				if (state && state.activeStudent) {
					me.restoreStudent(state.activeStudent, state.activeAssignment);
				} else {
					me.showRoot();
					me.fireEvent('close-reader');
				}
			});
	},


	restoreStudent: function(username, assignment) {
		var record, view;

		if (!this.rendered) {
			this.on('afterrender', this.restoreStudent.bind(this, username, assignment));
			return;
		}

		record = this.store.findBy(function(rec) {
			var user = rec.get('User');

			return username === NextThought.model.User.getIdFromRaw(user);
		});

		if (record >= 0) {
			record = this.store.getAt(record);

			view = this.showStudent(record);
		} else {
			console.error('Failed to load the store to the correct page for a student');
		}

		if (view && assignment) {
			view.restoreAssignment(assignment);
		} else {
			this.fireEvent('close-reader');
		}
	},


	setStateForAssignment: function(student, assignment) {
		this.pushState({
			activeStudent: student.getId ? student.getId() : student,
			activeAssignment: assignment.getId ? assignment.getId() : assignment
		});
	},


	popStateForAssignment: function() {
		this.pushState({
			activeAssignment: null
		});
	},


	setAssignmentsData: function() {
		this.clearAssignmentsData();
		var root = this.add({ xtype: 'course-assessment-admin-performance-root', pushState: this.pushState, replaceState: this.replaceState}),
			p = root.setAssignmentsData.apply(root, arguments);

		this.pushState({
			activeStudent: null
		});

		this.assignmentsData = Ext.Array.clone(arguments);
		this.store = root.store;
		this.mon(root, 'student-clicked', 'showStudentFromClick');
		return p;
	},

	clearAssignmentsData: function() {
		this.removeAll(true);
	},


	getRoot: function() {
		return this.items.first();
	},


	showRoot: function() {
		var root = this.getRoot(),
			layout = this.getLayout(),
			active = layout.getActiveItem();

		if (root !== active) {
			layout.setActiveItem(root);
			Ext.destroy(this.items.getRange(1));
		}

		this.pushState({
			activeStudent: null
		});
	},


	showStudentFromClick: function(view, rec) {
		this.showStudent(rec);
	},


	showStudent: function(rec) {
		var view,
			user = rec.get('User'),
			historyURL = rec.getLink('AssignmentHistory');

		if (!user || !historyURL) {
			console.warn('Unable to show student view', rec.get('User'), historyURL);
			return;
		}

		if (this.activeUser !== NextThought.model.User.getIdFromRaw(user)) {
			this.pushState({
				activeStudent: NextThought.model.User.getIdFromRaw(user)
			});
		}

		Ext.destroy(this.down('course-assessment-admin-performance-student'));

		view = this.add({
			xtype: 'course-assessment-admin-performance-student',
			student: user,
			historiesURL: historyURL,
			FinalGradeHistoryItem: rec.get('HistoryItemSummary'),
			predictedGrade: rec.get('PredictedGrade'),
			container: this,
			pageSource: NextThought.proxy.courseware.PagedPageSource.create({
				store: this.store,
				startingRec: rec
			})
		});

		view.setAssignmentsData.apply(view, this.assignmentsData);

		this.mon(view, {
			'goto': 'showStudent',
			'goup': 'showRoot'
		});

		return view;
	}
});
