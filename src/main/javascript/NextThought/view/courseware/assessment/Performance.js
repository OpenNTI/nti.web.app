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
				{ xtype: 'grade-chart' },
				{ xtype: 'box', cls: 'label', html: 'Cumulative Grade' },
				{ xtype: 'grade-performance-chart' },
				{ xtype: 'box', cls: 'label', autoEl: {
					cn: [
						{ tag: 'span', cls: 'you', html: 'You'},
						{ tag: 'span', cls: 'avg', html: 'Class AVG'}
					]
				} }
			]
		},
		{xtype: 'course-assessment-assignment-group', title: 'All Grades',
			anchor: '0 -200', layout: 'fit',
			cls: 'assignment-group grades', items: [
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
								 return value ? (value + ' Comments') : '';
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

		this.chartGrade = this.down('grade-chart');
		this.chartPerformance = this.down('grade-performance-chart');
		this.grid = this.down('grid');

		this.chartGrade.setGrade(80);

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
		this.chartPerformance.setStore(store);

		this.mon(this.grid, 'itemClick', 'goToAssignment');
	},


	afterRender: function() {
		this.callParent(arguments);
		//***** Begin Hide charts
		// No charts until we can get numerical grades. :}
		this.items.first().hide();
		this.items.last().anchor = '0 0';
		//***** End Hide charts
	},


	clearAssignmentsData: function() {
		this.store.removeAll();
	},


	goToAssignment: function(selModel, record) {
		var path = [
				this.pathRoot,
				record.get('name')
		];

		this.fireEvent('goto-assignment', record.get('item'), $AppConfig.userObject);
	},


	setAssignmentsData: function(data, history, outline) {
		var ntiid, raw = [];

		this.clearAssignmentsData();

		if (!data) {
			console.error('No data??');
			return;
		}

		function collect(o) {
			var id = o.getId(),
				h = history.getItem(id),
				submission = h && h.get('Submission'),
				feedback = h && h.get('Feedback'),
				grade = h && h.get('Grade'),
				pendingAssessment = h && h.get('pendingAssessment');

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

		this.store.loadRawData(raw);
	}
});
