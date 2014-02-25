Ext.define('NextThought.view.courseware.assessment.Performance', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-performance',
	ui: 'course-assessment',
	cls: 'course-performance',

	requires: [
		'NextThought.chart.Grade',
		'NextThought.chart.GradePerformance'
	],

	layout: 'anchor',

	items: [
		{
			cls: 'course-performance-header',
			xtype: 'container',
			layout: 'auto',
			items: [
				//{ xtype: 'grade-chart' },
				//{ xtype: 'box', cls: 'label', html: 'Cumulative Grade' },
				//{ xtype: 'grade-performance-chart' },
				//{ xtype: 'box', cls: 'label', autoEl: {
				//	cn: [
				//		{ tag: 'span', cls: 'you', html: 'You'},
				//		{ tag: 'span', cls: 'avg', html: 'Class AVG'}
				//	]
				//} }

				{ xtype: 'box', cls: 'grade-value', html: 'Not yet entered.', grade: true },
				{ xtype: 'box', cls: 'label', html: 'Course Grade' },

				{ xtype: 'box', cls: 'assignments-completed', html: '', msgTpl: '{0} of {1}' },
				{ xtype: 'box', cls: 'label', html: 'Assignments Completed' }
			]
		},
		{xtype: 'course-assessment-assignment-group', title: 'All Grades',
			anchor: '0 -200', layout: 'fit',
			cls: 'assignment-group grades scrollable', items: [
			{
				xtype: 'grid',
				ui: 'course-assessment',
				plain: true,
				border: false,
				frame: false,
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
							 { text: 'Assignment Name', dataIndex: 'name', flex: 1 },
							 { text: 'Assigned', dataIndex: 'assigned', xtype: 'datecolumn', width: 80, format: 'm/d' },
							 { text: 'Due', dataIndex: 'due', xtype: 'datecolumn', width: 70, format: 'm/d' },
							 { text: 'Completed', dataIndex: 'completed', width: 80, renderer: function(v) {
								 return (v && v.getTime() > 0) ? this.checkMarkTpl : '';
							 } },
							 { text: 'Score', dataIndex: 'grade', width: 70 },
							 { text: 'Feedback', dataIndex: 'feedback', width: 140, renderer: function(value) {
								 return value ? Ext.util.Format.plural(value, 'Comment') : '';
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
					console.log('Marking...');
					var cls = 'sortedOn',
						el = this.getEl();
					if (el) {
						el.select('.' + cls).removeCls(cls);
						if (c) {
							Ext.select(c.getCellSelector()).addCls(cls);
						}
					}
				},

				checkMarkTpl: Ext.DomHelper.markup({cls: 'check', html: '&#10003;'})
			}
		]}
	],

	pathRoot: 'Grades & Performance',


	initComponent: function() {
		this.callParent(arguments);

		this.enableBubble(['goto-assignment']);

		//this.chartGrade = this.down('grade-chart');
		//this.chartPerformance = this.down('grade-performance-chart');
		this.tempGrade = this.down('[grade]');
		this.tempCount = this.down('box[msgTpl]');
		this.grid = this.down('grid');

		//this.chartGrade.setGrade(80);

		var store = this.store = new Ext.data.Store({
			fields: [
				{name: 'ntiid', type: 'string'},
				{name: 'containerId', type: 'string'},
				{name: 'name', type: 'string'},
				{name: 'assigned', type: 'date'},
				{name: 'due', type: 'date'},
				{name: 'completed', type: 'date'},
				{name: 'Grade', type: 'auto'},//object
				{name: 'grade', type: 'auto'},//value
				{name: 'AverageGrade', type: 'int', mapping: 'average'},//ignored for now
				{name: 'feedback', type: 'int'},
				{name: 'item', type: 'auto'},
				{name: 'Submission', type: 'auto'},
				{name: 'pendingAssessment', type: 'auto'},
				{name: 'Feedback', type: 'auto'}
		    ],
			sorters: [
				{property: 'due', direction: 'DESC'}
			]
		});

		this.grid.bindStore(store);
		//this.chartPerformance.setStore(store);

		this.mon(this.grid, 'itemClick', 'fireGoToAssignment');

		this.mon(store, 'datachanged', 'updateHeader');
	},


	updateHeader: function() {
		function complete(o) {return !!o.get('completed'); }

		var tpl = this.tempCount.msgTpl,
			t = this.store.getCount(),
			c = this.store.getRange().filter(complete).length;
		this.tempCount.update(Ext.String.format(tpl, c, t));

		if (this.finalGrade && !Ext.isEmpty(this.finalGrade.trim())) {
			t = this.finalGrade.split(/\W/);
			this.tempGrade.update(Ext.DomHelper.markup([
				{tag: 'span', cls: 'score-grade', html: t[0]},
				'&nbsp;',
				{tag: 'span', cls: 'letter-grade', html: t[1]}
			]));
		}
	},


	clearAssignmentsData: function() {
		this.store.removeAll();
	},


	fireGoToAssignment: function(selModel, record) {
		var date = Ext.Date.format(record.get('assigned'), 'l F j \\a\\t g:i A');

		if (!record || record.get('assigned') > new Date()) {
			alert('This assignment will be availble on ' + date);
			return;
		}
		this.fireEvent('goto-assignment', record.get('item'), $AppConfig.userObject);
	},

	//This is a read-only view from the STUDENT'S perspective. READ: updates when students navigate to it.
	setAssignmentsData: function(assignments, history) {
		var raw = [], me = this;

		this.clearAssignmentsData();

		if (!assignments) {
			console.error('No assignments??');
			return;
		}

		function collect(o) {
			var id = o.getId(),
				h = history.getItem(id),
				submission = h && h.get('Submission'),
				feedback = h && h.get('Feedback'),
				grade = h && h.get('Grade'),
				pendingAssessment = h && h.get('pendingAssessment');

			if (o.doNotShow()) {
				me.maybeSetFinalGrade(o, h, grade);
				return;
			}

			raw.push({
				ntiid: id,
				containerId: o.get('containerId'),
				item: o,
				name: o.get('title'),
				assigned: o.get('availableBeginning'),
				due: o.get('availableEnding'),
				completed: submission && submission.get('CreatedTime'),
				Grade: grade,
				grade: grade && (grade.get('value') || '').split(' ')[0],
				average: grade && grade.get('average'),
				Feedback: feedback,
				feedback: feedback && feedback.get('Items').length,
				pendingAssessment: pendingAssessment,
				Submission: submission
			});
		}

		assignments.get('Items').forEach(collect);

		this.store.loadRawData(raw);
	},


	maybeSetFinalGrade: function(assignment, history, grade) {
		if (!Ext.String.endsWith(assignment.get('NTIID'), ':Final_Grade')) {
			return;
		}

		try {
			this.finalGrade = grade && grade.get('value');
			this.updateHeader();
		} catch (e) {
			console.error(e.stack || e.message || e);
		}
	}
});
