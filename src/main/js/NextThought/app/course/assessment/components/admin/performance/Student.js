Ext.define('NextThought.app.course.assessment.components.admin.performance.Student', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance-student',

	mixins: {
		State: 'NextThought.mixins.State'
	},

	requires: [
		'NextThought.app.course.assessment.components.admin.performance.Header',
		'NextThought.app.course.assessment.components.admin.Grid'
	],

	layout: 'none',

	ui: 'course-assessment',
	cls: 'course-assessment-admin assignment-item',

	pathRoot: {
		label: 'Grades & Performance',
		title: 'Grades & Performance',
		route: 'performance'
	},

	items: [{
		xtype: 'course-admin-grid',
		flex: 1,
		cls: 'student-performance-overview'
	}],


	initComponent: function() {
		this._masked = 0;
		this.callParent(arguments);

		var grid = this.down('grid');

		//Having the student in the precache tells it to
		//restore to the page the student is on
		this.pathRoot.precache = {student: this.student};

		this.pathBranch = {
			label: this.student.toString()
		};

		this.header = this.insert(0, {
			xtype: 'course-assessment-admin-performance-header',
			path: [this.pathRoot, this.pathBranch],
			student: this.student,
			status: this.status,
			pageSource: this.pageSource,
			doNavigation: this.doNavigation.bind(this)
		});

		this.mon(grid, {
			'itemClick': this.maybeShowAssignment.bind(this),
			'sortchange': this.changeSort.bind(this)
		});
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


	refresh: function() {
		var grid = this.down('grid'),
			view = grid && grid.view;

		view.refresh();

		return Promise.resolve();
	},


	setAssignmentsData: function(assignments) {
		if (!assignments) {
			console.error('No Assignments?');
			return Promise.reject('no data?');
		}

		var state = this.getCurrentState() || {};

		this.header.setGradeBook(this.summary.hasFinalGrade() && this.FinalGradeHistoryItem);

		this.header.setPredictedGrade(this.predictedGrade);

		this.store = assignments.getStudentHistory(this.historiesURL, this.student.getId());

		this.store.on({
			beforeload: this.mask.bind(this),
			load: this.unmask.bind(this)
		});

		this.down('grid').bindStore(this.store);

		return this.applyState(state);
	},


	setEnrollmentData: function(enrollment) {
		var mailLink = enrollment && enrollment.getLink('Mail'),
			me = this;

		this.courseEnrollment = enrollment;
		if (mailLink) {
			this.header.onceRendered
				.then(function() {
					if (me.header.setupCourseEmail) {
						me.header.setupCourseEmail(mailLink);
					}
				});
		}
	},


	applyState: function(state) {
		if (this.applyingState) { return; }

		var me = this,
			store = me.store;

		me.applyingState = true;

		return new Promise(function(fulfill, reject) {
			function finish() {
				delete me.applyingState;

				if (state.sort && state.sort.prop) {
					store.sort(state.sort.prop, state.sort.direction, null, false);
				}

				fulfill();
			}

			if (!me.store.recordsFilledIn) {
				me.mon(store, {
					single: true,
					'records-filled-in': finish
				});

				me.store.load();
			} else {
				finish();
			}
		});
	},


	changeSort: function(ct, column, direction) {
		var prop = column.sortOn || column.dataIndex,
			state = this.getCurrentState() || {};

		if (prop) {
			state.sort = {
				prop: prop,
				direction: direction
			};
		} else {
			delete state.sort;
		}

		if (!this.applyingState) {
			this.setState(state);
		}
	},


	maybeShowAssignment: function(view, record, node, index, e) {
		var selModel = view.getSelectionModel(),
			selection = selModel && selModel.selection,
			dataIndex = selection && selection.columnHeader.dataIndex;

		if (dataIndex !== 'Grade') {
			this.showAssignment(selModel, record);
		}
	},


	showAssignment: function(selModel, record) {
		var userId = this.student.getURLPart(),
			assignmentId = record.get('AssignmentId');

		assignmentId = ParseUtils.encodeForURI(assignmentId);

		this.pushRoute('', '/performance/' + userId + '/' + assignmentId);
	},


	doNavigation: function(title, route, precache) {
		var userId = this.student.getId();

		this.pushRoute(title, route, precache);
	}
});
