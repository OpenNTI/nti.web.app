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
		this._masked = 0;
		this.callParent(arguments);
		this.enableBubble(['show-assignment']);

		this.pathBranch = this.student.toString();

		this.header = this.insert(0, {
			xtype: 'course-assessment-admin-performance-header',
			path: [this.pathRoot, this.pathBranch],
			student: this.student,
			status: this.status,
			pageSource: this.pageSource
		});

		this.relayEvents(this.header, ['goup', 'goto']);

		this.on({
			'reader-closing': 'maybeRemoveFilter',
			'reader-initializing': 'applyPagerFilter'
		});
		this.mon(this.down('grid'), 'itemclick', 'maybeShowAssignment');
	},

	afterRender: function() {
		this.callParent(arguments);
		if (this._masked) {
			this._showMask();
		}
	},


	_showMask: function() {
		var el = this.el;
		this._maskIn = setTimeout(function() {
			if (el && el.dom) {
				el.mask(getString('NextThought.view.courseware.assessment.admin.performance.Student.loading'), 'loading', true);
			}
		}, 1);
	},


	mask: function() {
		this._masked++;
		if (!this.rendered) {
			return;
		}
		this._showMask();
	},


	unmask: function() {
		this._masked--;
		if (this._masked <= 0) {
			this._masked = 0;
			clearTimeout(this._maskIn);
			if (this.el && this.el.dom) {
				this.el.unmask();
			}
		}
	},


	setAssignmentsData: function(assignments) {
		var user = this.student.getId();

		if (!assignments) {
			console.error('No assignments??');
			return Promise.reject('no data?');
		}

		this.header.setGradeBook(assignments.gradeBook);
		this.store = assignments.getViewForStudent(user);
		this.store.on({
			scope: this,
			beforeload: 'mask',
			load: 'unmask'
		});
		this.down('grid').bindStore(this.store);
		this.store.load();
		return Promise.resolve();
	},


	maybeShowAssignment: function(view, record, node, index, e) {
		var selModel = view.getSelectionModel(),
			selection = selModel && selModel.selection,
			dataIndex = selection && selection.columnHeader.dataIndex;


		if (dataIndex !== 'Grade') {
			this.showAssignment(selModel, record);
		}
	},


	applyPagerFilter: function() {},


	maybeRemoveFilter: function() {},

	//<editor-fold desc="Navigation Events">
	showAssignment: function(selModel, record) {
		var path = [
				this.pathRoot,
				this.pathBranch,
				record.get('name')
		];

		this.applyPagerFilter();
		this.fireEvent('show-assignment', this, record.get('item'), record, this.student, path,
				NextThought.util.PageSource.create({
					store: this.store,
					current: this.store.indexOf(record)
				})
		);
	}
	//</editor-fold>
});
