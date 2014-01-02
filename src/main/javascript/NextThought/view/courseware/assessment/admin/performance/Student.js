Ext.define('NextThought.view.courseware.assessment.admin.performance.Student', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance-student',

	requires: [
		'NextThought.view.courseware.assessment.admin.performance.Header'
	],

	layout: 'anchor',

	profileLinkCard: false,

	ui: 'course-assessment',
	cls: 'course-assessment-admin assignment-item',

	pathRoot: 'Grades & Performance',

	items: [{
		xtype: 'grid',
		flex: 1,
		anchor: '0 -172',
		ui: 'course-assessment',
		plain: true,
		border: false,
		frame: false,
		cls: 'student-performance-overview',
		scroll: 'vertical',
		sealedColumns: true,
		enableColumnHide: false,
		enableColumnMove: false,
		enableColumnResize: false,
		columns: {
			ui: 'course-assessment',
			plain: true,
			border: false,
			frame: false,
			items: [
					   { text: 'Assignment', dataIndex: 'name', tdCls: 'padded-cell', padding: '0 0 0 30', flex: 1 },
					   { text: 'Completed', dataIndex: 'completed', width: 150, renderer: function(v, col, rec) {
						   var d = rec.get('due'),
								   s = (v && v.get && v.get('Last Modified')) || v;
						   if (!s) {
							   return Ext.DomHelper.markup({cls: 'incomplete', html: 'Due ' + Ext.Date.format(d, 'd/m')});
						   }
						   if (d > s) {
							   return Ext.DomHelper.markup({cls: 'ontime', html: 'On Time'});
						   }

						   d = new Duration(Math.abs(s - d) / 1000);
						   return Ext.DomHelper.createTemplate({cls: 'late', html: '{late} Late'}).apply({
							   late: d.ago().replace('ago', '').trim()
						   });
					   } },
					   { text: 'Score', dataIndex: 'grade', width: 70 },
					   { text: 'Feedback', dataIndex: 'Feedback', width: 140, renderer: function(value) {
						   return value ? (value.get('Items').length + ' Comments') : '';
					   } }
				   ].map(function(o) {
						return Ext.applyIf(o, {
							ui: 'course-assessment',
							border: false,
							sortable: true,
							menuDisabled: true
						});
					})
		},

		listeners: {
			sortchange: function(ct, column) { ct.up('grid').markColumn(column); },
			selectionchange: function(sm, selected) { sm.deselect(selected); },
			viewready: function(grid) {
				grid.mon(grid.getView(), 'refresh', function() {
					grid.markColumn(grid.down('gridcolumn[sortState]'));
				});
			}
		},

		markColumn: function(c) {
			var cls = 'sortedOn', el = this.getEl();
			if (el) {
				el.select('.' + cls).removeCls(cls);
				if (c) {
					Ext.select(c.getCellSelector()).addCls(cls);
				}
			}
		}
	}],


	initComponent: function() {
		var grid, store;

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

		grid = this.down('grid');
		store = this.store = new Ext.data.Store({
			fields: [
				{name: 'ntiid', type: 'string'},
				{name: 'item', type: 'auto'},
				{name: 'name', type: 'string'},
				{name: 'due', type: 'date'},
				{name: 'completed', type: 'date'},
				{name: 'Submission', type: 'auto'},
				{name: 'Grade', type: 'auto'},//object
				{name: 'grade', type: 'auto'},//value
				{name: 'pendingAssessment', type: 'auto'},
				{name: 'Feedback', type: 'auto'}
			],
			sorters: [
				{property: 'due', direction: 'ASC'}
			]
		});
		grid.bindStore(store);
		this.mon(grid, 'itemclick', 'goToAssignment');
	},


	setAssignmentsData: function(data, history, outline, instance, gradeBook) {
		var ntiid, raw = [], store = this.store, user = this.student.getId();

		if (!data) {
			console.error('No data??');
			return;
		}

		this.header.setGradeBook(gradeBook);

		function getGrade(assignment) {
			return gradeBook.getItem(assignment.get('title')).getFieldItem('Items', user);
		}

		function collect(o) {
			if (o.get('title') === 'Final Grade') { return; }
			var id = raw.length,
				ntiid = o.getId(),
				grade = getGrade(o);

			raw.push({
				id: id,
				ntiid: ntiid,
				containerId: o.get('containerId'),
				item: o,
				name: o.get('title'),
				assigned: o.get('availableBeginning'),
				due: o.get('availableEnding'),

				Grade: grade,
				grade: grade && (grade.get('value') || '').split(' ')[0],
				average: grade && grade.get('average')
			});

			Service.request(o.getLink('GradeSubmittedAssignmentHistory')).done(function(json) {
				var r = store.getById(id), s;
				if (r) {
					json = Ext.decode(json, true) || {};
					json = json.Items || {};
					json = json[user];
					if (json) {
						json = ParseUtils.parseItems(json)[0];
						s = json.get('Submission');
						r.set({
							pendingAssessment: json.get('pendingAssessment'),
							Submission: s,
							Feedback: json.get('Feedback'),
							completed: s && s.get('CreatedTime')
						});
					}
				}
			});
		}

		delete data.href;//all other keys are container ids...so, lets just drop it.

		for (ntiid in data) {
			if (data.hasOwnProperty(ntiid)) {
				if (!ParseUtils.isNTIID(ntiid)) {//just to be safe
					console.warn('[W] Ignoring:', ntiid);
					continue;
				}
				ParseUtils.parseItems(data[ntiid]).forEach(collect);
			}
		}

		store.loadRawData(raw);
	},


	//<editor-fold desc="Navigation Events">
	goToAssignment: function(selModel, record) {
		var path = [
				this.pathRoot,
				this.pathBranch,
				record.get('name')
		];

		this.fireEvent('show-assignment', this, record.get('item'), record, this.student, path, this.store, this.store.indexOf(record) + 1);
	}
	//</editor-fold>
});
