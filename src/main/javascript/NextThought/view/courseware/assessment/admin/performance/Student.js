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
		viewConfig: {
			xhooks: {
				walkCells: function(pos, direction, e, preventWrap, verifierFn, scope) {
					return this.callParent([pos, direction, e, preventWrap, function(newPos) {
						var newerPos = false;
						if (newPos.column === 2) {
							return true;
						}
						newerPos = this.walkCells(newPos, direction, e, preventWrap);
						if (newerPos) {
							Ext.apply(newPos, newerPos);
							return true;
						}
						return false;
					}, this]);
				}
			}
		},
		selType: 'cellmodel',
		plugins: [
			{
				ptype: 'cellediting',
				clicksToEdit: 1,
				listeners: {
					beforeedit: {
						element: 'el',
						fn: function(editor, e) {
							if (!e.record) { return false; }

							var noSubmit = e.record.get('item').get('category_name') === 'no_submit',
								gradeRec = e.record.get('Grade'),
								value = gradeRec && gradeRec.get('value'),
								grades = value && value.split(' '),
								grade = grades && grades[0];

							if (!gradeRec && noSubmit) {
								e.record.set('Grade', NextThought.model.courseware.Grade.create());
							} else if (!gradeRec) {
								return false;
							}

							e.value = grade;
						}
					},
					validateedit: {
						element: 'el',
						fn: function(editor, e) {
							var grade = e.record.get('Grade'),
								v = grade.get('value');

							v = v && v.split(' ')[0];

							if (v !== e.value) {
								grade.set('value', e.value + ' -');
								grade.save();
							}

							return false;
						}
					}
				}
			}
		],
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
							   return Ext.DomHelper.markup({cls: 'incomplete', html: 'Due ' + Ext.Date.format(d, 'm/d')});
						   }
						   if (d > s) {
							   return Ext.DomHelper.markup({cls: 'ontime', html: 'On Time'});
						   }

						   d = new Duration(Math.abs(s - d) / 1000);
						   return Ext.DomHelper.createTemplate({cls: 'late', html: '{late} Late'}).apply({
							   late: d.ago().replace('ago', '').trim()
						   });
					   } },
					   { text: 'Score', componentCls: 'score', dataIndex: 'Grade', width: 70, editor: 'textfield', renderer: function(val) {
							val = val && val.get('value');
							return val && val.split(' ')[0];
					   } ,listeners: {
							headerclick: function() {
								var store = this.up('grid').getStore(),
									sorter = {
										direction: this.sortState,
										sorterFn: function(o1, o2) {
											o1 = o1 && o1.get('Grade');
											o1 = o1 && o1.get('value');
											o1 = o1 && o1.split(' ')[0];
											o1 = o1 || '';

											o2 = o2 && o2.get('Grade');
											o2 = o2 && o2.get('value');
											o2 = o2 && o2.split(' ')[0];
											o2 = o2 || '';

											return Globals.naturalSortComparator(o1, o2);
										}
									};

								store.sorters.clear();
								store.sorters.add('answers', sorter);
								store.sort();
								if (store.bind) {
									store = store.bind;
									store.sorters.clear();
									store.sorters.add('Grade', sorter);
									store.sort();
								}
							}
						}},
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
