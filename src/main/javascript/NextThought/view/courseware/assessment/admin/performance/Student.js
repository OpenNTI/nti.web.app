Ext.define('NextThought.view.courseware.assessment.admin.performance.Student', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance-student',

	requires: [
		'NextThought.view.courseware.assessment.admin.performance.Header',
		'NextThought.view.courseware.assessment.admin.Grid'
	],

	layout: 'anchor',

	profileLinkCard: false,

	ui: 'course-assessment',
	cls: 'course-assessment-admin assignment-item',

	pathRoot: 'Grades & Performance',

	items: [{
		xtype: 'course-admin-grid',
		flex: 1,
		anchor: '0 -172',
		cls: 'student-performance-overview'
	}],


	initComponent: function() {
		this.callParent(arguments);
		this.enableBubble(['show-assignment']);

		this.pathBranch = this.student.toString();

		this.header = this.insert(0, {
			xtype: 'course-assessment-admin-performance-header',
			path: [this.pathRoot, this.pathBranch],
			student: this.student,
			page: this.page,
			total: this.total
		});

		this.relayEvents(this.header, ['goup', 'goto']);


		this.mon(this.down('grid'), 'itemclick', 'maybeGoToAssignment');
	},


	setAssignmentsData: function(assignments, history, instance, gradeBook) {
		var user = this.student.getId();

		if (!assignments) {
			console.error('No assignments??');
			return;
		}

		this.header.setRoster(assignments.get('Roster'));
		this.header.setGradeBook(gradeBook);
		this.store = assignments.getViewForStudent(user);
		this.down('grid').bindStore(this.store);
	},

	maybeGoToAssignment: function(view, record, node, index, e) {
		var selModel = view.getSelectionModel(),
			selection = selModel && selModel.selection,
			dataIndex = selection && selection.columnHeader.dataIndex,
			noSubmit = record.get('item').get('category_name') === 'no_submit';

		//if we didn't click on the grade cell or we don't have a grade yet
		if (noSubmit) {
			return;
		}

		if (dataIndex !== 'Grade' || !record.get('Grade')) {
			this.goToAssignment(selModel, record);
		}
	},

	applyPagerFilter: function() {
		//admins can see all assignments at any time.
		this.store.filter({
			id: 'open',
			filterFn: function(rec) {
				var item = rec && rec.get('item'),
					parts = item && item.get('parts');

				return parts && parts.length; //ensure there are submit parts (if no submit parts, its not to be subbmitted in the platform)
			}
		});
	},

	//<editor-fold desc="Navigation Events">
	goToAssignment: function(selModel, record) {
		var path = [
				this.pathRoot,
				this.pathBranch,
				record.get('name')
		];

		this.applyPagerFilter();
		this.fireEvent('show-assignment', this, record.get('item'), record, this.student, path, this.store, this.store.indexOf(record) + 1);
	}
	//</editor-fold>
});
