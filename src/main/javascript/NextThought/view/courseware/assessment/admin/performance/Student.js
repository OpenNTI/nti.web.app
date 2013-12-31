Ext.define('NextThought.view.courseware.assessment.admin.performance.Student', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance-student',

	requires: [
		'NextThought.view.courseware.assessment.admin.performance.Header'
	],

	profileLinkCard: false,

	ui: 'course-assessment',
	cls: 'course-assessment-admin assignment-item',

	layout: 'auto',
	componentLayout: 'natural',
	childEls: ['body'],
	getTargetEl: function() { return this.body; },

	pathRoot: 'Grades & Performance',

	renderTpl: Ext.DomHelper.markup([
	 	{ id: '{id}-body', cls: 'body', cn: ['{%this.renderContainer(out,values)%}'] }
	 ]),


	assessment: {
			xtype: 'grid',
			ui: 'course-assessment',
			plain: true,
			border: false,
			frame: false,
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
						   { text: 'Completed', dataIndex: 'Submission', width: 150, renderer: function(v) {
							   var d = new Date(0),
								   s = v && v.get('Last Modified');
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
						   { text: 'Score', dataIndex: 'Grade', width: 70 },
						   { text: 'Feedback', dataIndex: 'Feedback', width: 140, renderer: function(value) {
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
				var cls = 'sortedOn', el = this.getEl();
				if (el) {
					el.select('.' + cls).removeCls(cls);
					if (c) {
						Ext.select(c.getCellSelector()).addCls(cls);
					}
				}
			}
	},


	initComponent: function() {
		var grid, store, header;

		this.callParent(arguments);
		this.enableBubble(['show-assignment']);

		this.pathBranch = this.student.toString();

		header = this.add({
			xtype: 'course-assessment-admin-performance-header',
			path: [this.pathRoot, this.pathBranch],
			student: this.student,
			page: this.page,
			total: this.total
		});

		this.relayEvents(header, ['goup', 'goto']);

		this.add(this.assessment);

		grid = this.down('grid');
		store = this.store = new Ext.data.Store({
			fields: [
				{name: 'ntiid', type: 'string'},
				{name: 'name', type: 'string'},
				{name: 'Submission', type: 'date'},
				{name: 'Grade', type: 'auto'},
				{name: 'Feedback', type: 'int'}
			],
			sorters: [
				{property: 'due', direction: 'DESC'}
			]
		});
		grid.bindStore(store);
		this.mon(grid, 'itemclick', 'goToAssignment');
	},


	setAssignmentsData: function(data, history, outline, instance, gradeBook) {
		var ntiid, raw = [];

		if (!data) {
			console.error('No data??');
			return;
		}

		function collect(o) {
			var id = o.getId(),
				h = history.getItem(id),
				submission = h && h.get('Submission'),
				feedback = h && h.get('Feedback'),
				grade = h && h.get('Grade');

			raw.push({
				ntiid: id,
				containerId: o.get('containerId'),
				item: o,
				name: o.get('title'),
				assigned: o.get('availableBeginning'),
				due: o.get('availableEnding'),
				completed: submission && submission.get('CreatedTime'),
				Grade: grade && grade.get('grade'),
				average: grade && grade.get('average'),
				Feedback: feedback && feedback.get('Items').length
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
	},


	//<editor-fold desc="Navigation Events">
	goToAssignment: function(selModel, record) {
		var path = [
				this.pathRoot,
				this.pathBranch,
				record.get('name')
		];

		this.fireEvent('show-assignment', this, record.get('ntiid'), record, this.student, path, this.store, this.store.indexOf(record) + 1);
	}
	//</editor-fold>
});
