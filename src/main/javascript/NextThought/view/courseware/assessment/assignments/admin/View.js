Ext.define('NextThought.view.courseware.assessment.assignments.admin.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-assignments',
	requires: [
		'NextThought.view.courseware.assessment.assignments.admin.Root',
		'NextThought.view.courseware.assessment.assignments.admin.Assignment'
	],

	handlesAssignment: true,

	layout: 'card',
	onAdd: function(item) { this.getLayout().setActiveItem(item); },


	setAssignmentsData: function() {
		this.clearAssignmentsData();
		var root = this.add({ xtype: 'course-assessment-admin-assignments-root' });
		root.setAssignmentsData.apply(root, arguments);
		this.store = root.store;
		this.mon(root, 'assignment-clicked', 'showAssignmentFromClick');
	},

	clearAssignmentsData: function() {
		this.removeAll(true);
	},


	showRoot: function() {
		this.getLayout().setActiveItem(0);
		Ext.destroy(this.items.getRange(1));
	},


	showAssignmentFromClick: function(rec) {
		this._doShowAssignment(rec);
	},


	_doShowAssignment: function(rec) {
		Ext.destroy(this.down('course-assessment-admin-assignments-item'));
		if (!rec) {
			console.error('No Record passed, showing root.');
			this.showRoot();
			return;
		}

		this.mon(this.add({
			xtype: 'course-assessment-admin-assignments-item',
			assignmentTitle: rec.get('name'),
			due: rec.get('due'),
			page: this.store.indexOf(rec) + 1,
			total: this.store.getCount(),
			assignment: rec.get('item')
		}), {
			'goto': 'showAssignmentAt',
			'goup': 'showRoot'
		});
	},

	showAssignmentAt: function(index) {
		var rec = this.store.getAt(index);
		if (!rec) {
			console.error('No record at index: ' + index);
			return;
		}
		this._doShowAssignment(rec);
	},


	showAssignment: function(assignment, user) {
		var root = this.items.first();

		if (!root) {
			this.on({
				single: true,
				buffer: 1,
				add: Ext.bind(this.showAssignment, this, arguments)
			});
			return;
		}

		root.showAssignment(assignment, user);
	}
});
