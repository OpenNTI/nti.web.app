Ext.define('NextThought.view.courseware.assessment.admin.performance.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance',
	requires: [
		'NextThought.view.courseware.assessment.admin.performance.Root',
		'NextThought.view.courseware.assessment.admin.performance.Student'
	],

	layout: 'card',
	onAdd: function(item) { this.getLayout().setActiveItem(item); },


	setAssignmentsData: function() {
		this.clearAssignmentsData();
		var root = this.add({ xtype: 'course-assessment-admin-performance-root' }),
			p = root.setAssignmentsData.apply(root, arguments);

		this.assignmentsData = Ext.Array.clone(arguments);
		this.store = root.store;
		this.mon(root, 'student-clicked', 'showStudentFromClick');
		return p;
	},

	clearAssignmentsData: function() {
		this.removeAll(true);
	},


	showRoot: function() {
		this.getLayout().setActiveItem(0);
		Ext.destroy(this.items.getRange(1));
	},


	showStudentFromClick: function(view, rec) {
		this.showStudent(rec);
	},


	showStudent: function(rec) {
		var view,
			links = rec.get('Links'),
			historyURL = Service.getLinkFrom(rec.get('Links'), 'AssignmentHistory');

		if (!rec.get('User') || !historyURL) {
			console.warn('Unable to show student view', rec.get('User'), historyURL);
			return;
		}

		Ext.destroy(this.down('course-assessment-admin-performance-student'));

		view = this.add({
			xtype: 'course-assessment-admin-performance-student',
			student: rec.get('User'),
			historiesURL: historyURL,
			FinalGradeHistoryItem: rec.get('HistoryItemSummary'),
			pageSource: NextThought.util.PageSource.create({
				store: this.store,
				current: this.store.indexOf(rec)
			})
		});

		view.setAssignmentsData.apply(view, this.assignmentsData);

		this.mon(view, {
			'goto': 'showStudent',
			'goup': 'showRoot'
		});
	}
});
