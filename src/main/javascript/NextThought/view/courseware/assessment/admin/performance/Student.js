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
			page: this.page,
			total: this.total
		});

		this.relayEvents(this.header, ['goup', 'goto']);


		this.mon(this.down('grid'), 'itemclick', 'maybeGoToAssignment');
		this.mask();
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
				el.mask('Loading', 'loading', true);
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


	setAssignmentsData: function(assignments, history, instance, gradeBook) {
		var user = this.student.getId(), promise;

		if (!assignments) {
			console.error('No assignments??');
			return;
		}

		this.header.setRoster(assignments.get('Roster'));
		this.header.setGradeBook(gradeBook);
		this.store = assignments.getViewForStudent(user);
		this.down('grid').bindStore(this.store);

		promise = this.store._building || Promise.fulfill();
		promise
				.done(this.unmask.bind(this))
				.fail(this.onError.bind(this));
	},


	onError: function(reason) {
		alert({title: 'Well, this is embarrassing!', msg: 'There was an unforeseen error loading this view. A report has been logged.'});
		setTimeout(function() { throw reason; }, 1);
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
