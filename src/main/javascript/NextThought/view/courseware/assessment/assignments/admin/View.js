Ext.define('NextThought.view.courseware.assessment.assignments.admin.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-assignments',
	requires: [
		'NextThought.util.PageSource',
		'NextThought.view.courseware.assessment.assignments.admin.Root',
		'NextThought.view.courseware.assessment.assignments.admin.Assignment'
	],

	handlesAssignment: true,

	layout: 'card',
	onAdd: function(item) { this.getLayout().setActiveItem(item); },


	restoreState: function(state, active) {
		var me = this,
			root = me.getRoot();

		return root.restoreState(state)
			.then(function() {
				if (state && state.activeAssignment) {
					me.restoreToAssignment(state.activeAssignment, state.activeStudent, state);
				} else {
					me.showRoot();
					me.fireEvent('close-reader');
				}
			});
	},


	restoreToAssignment: function(assignment, student, state) {
		var me = this,
			record, view, params;

		record = this.store.findBy(function(rec) {
			var item = rec.get('item');

			return assignment === (item && item.getId());
		});

		if (record >= 0) {
			record = this.store.getAt(record);

			view = this._doShowAssignment(record);
		}

		if (view) {
			view.restoreState(state)
				.then(function() {
					if (student) {
						view.restoreStudent(student);
					} else {
						me.fireEvent('close-reader');
					}
				});
		}
	},


	setStateForAssignment: function(student, assignment) {
		this.pushState({
			activeStudent: student.getId ? student.getId() : student,
			activeAssignment: assignment.getId ? assignment.getId() : assignment
		});
	},


	setAssignmentsData: function(assignments) {
		this.clearAssignmentsData();

		var root = this.add({ xtype: 'course-assessment-admin-assignments-root', pushState: this.pushState, replaceState: this.replaceState }),
			p = root.setAssignmentsData.apply(root, arguments);

		this.pushState({
			activeAssignment: null
		});

		this.assignments = assignments;
		this.store = root.store;
		this.mon(root, 'assignment-clicked', 'showAssignmentFromClick');

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
			activeAssignment: null
		});
	},


	showAssignmentFromClick: function(rec, extraParams) {
		this._doShowAssignment(rec, extraParams);
	},


	_doShowAssignment: function(rec, extraParams) {
		Ext.destroy(this.down('course-assessment-admin-assignments-item'));

		if (!rec) {
			console.error('No Record passed, showing root.');
			this.showRoot();
			return;
		}

		var assignment = rec.get('item'), view;

		this.pushState({
			activeAssignment: assignment.getId()
		});

		view = this.add({
			xtype: 'course-assessment-admin-assignments-item',
			assignmentTitle: rec.get('name'),
			due: rec.get('due'),
			assignment: assignment,
			assignments: this.assignments,
			pushState: this.pushState,
			replaceState: this.replaceState,
			extraParams: extraParams,
			pageSource: NextThought.util.PageSource.create({
				store: this.store,
				current: this.store.indexOf(rec)
			})
		});

		this.mon(view, {
			'goto': '_doShowAssignment',
			'goup': 'showRoot'
		});

		return view;
	},


	showAssignment: function(assignment, user) {
		var root = this.items.first();

		if (!root) {
			this.on({
				single: true,
				buffer: 1,
				add: this.showAssignment.bind(this, assignment, user)
			});
			return;
		}

		return root.showAssignment(assignment, user);
	}
});
