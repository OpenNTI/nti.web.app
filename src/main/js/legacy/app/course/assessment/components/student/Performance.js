const Ext = require('@nti/extjs');
const { scoped } = require('@nti/lib-locale');

const Globals = require('legacy/util/Globals');
const { getString, getFormattedString } = require('legacy/util/Localization');

const t = scoped(
	'nti-web-app.course.assessment.components.student.Performance',
	{
		coursegrade: 'Course Grade',
		completed: 'Assignments Completed',
		assignmentName: 'Assignment',
		assigned: 'Assigned',
		allGrades: 'All Grades',
	}
);

require('legacy/mixins/Router');
require('legacy/common/chart/Grade');
require('legacy/common/chart/GradePerformance');

const StudentPerformance = (module.exports = exports = Ext.define(
	'NextThought.app.course.assessment.components.student.Performance',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.course-assessment-performance',

		statics: {
			getScoreSorter: function () {
				function get(o) {
					var grade = o.get('Grade'),
						values = grade && grade.getValues();

					return (values && values.value) || '';
				}

				return function (a, b) {
					var aComp = a.get('completed'),
						bComp = b.get('completed'),
						aVal = get(a),
						bVal = get(b),
						aNum = parseFloat(aVal),
						bNum = parseFloat(bVal),
						sort;

					//Sort completed assignments to the top and
					//uncompleted to the bottom
					if (aComp && !bComp) {
						sort = -1;
					} else if (!aComp && bComp) {
						sort = 1;
						//Sort purely Numeric values to the top and
						//mixed alphanumeric to the bottom
					} else if (!isNaN(aNum) && isNaN(bNum)) {
						sort = -1;
					} else if (isNaN(aNum) && !isNaN(bNum)) {
						sort = 1;
						//Sort higher numbers to the top and
						//lower numbers to the bottom
					} else if (!isNaN(aNum) && !isNaN(bNum)) {
						sort = aNum > bNum ? -1 : aNum === bNum ? 0 : 1;
						//Sort the strings natural, to put A on top and
						//Z on bottom
					} else {
						sort = Globals.naturalSortComparator(aVal, bVal);
					}

					return sort;
				};
			},
		},

		mixins: {
			Router: 'NextThought.mixins.Router',
		},

		ui: 'course-assessment',
		cls: 'course-performance',
		layout: 'none',

		items: [
			{
				cls: 'nti-header course-performance-header',
				xtype: 'container',
				layout: 'none',
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

					{
						xtype: 'box',
						cls: 'grade-value',
						html: getString(
							'NextThought.view.courseware.assessment.Performance.notentered'
						),
						grade: true,
					},
					{
						xtype: 'box',
						cls: 'label',
						get html() {
							return t('coursegrade');
						},
						gradeLabel: true,
						disclaimerTpl: new Ext.XTemplate(
							Ext.DomHelper.markup({
								cls: 'disclaimer',
								'data-qtip': '{qtip}',
							})
						),
						addDisclaimer: function (disclaimer) {
							if (!this.rendered) {
								this.on(
									'afterrender',
									this.addDisclaimer.bind(this, disclaimer)
								);
								return;
							}

							var current = this.el.down('.disclaimer');

							if (disclaimer) {
								if (!current) {
									this.disclaimerTpl.append(this.el, {
										qtip: disclaimer,
									});
								}
							} else if (current) {
								current.destroy();
							}
						},
					},

					{
						xtype: 'box',
						cls: 'assignments-completed',
						html: '',
						msgTpl: getString(
							'NextThought.view.courseware.assessment.Performance.outof'
						),
					},
					{
						xtype: 'box',
						cls: 'label',
						get html() {
							return t('completed');
						},
					},
				],
			},
			{
				xtype: 'grouping',
				get title() {
					return t('allGrades');
				},
				anchor: '0 -200',
				layout: 'none',
				cls: 'grades scrollable',
				items: [
					{
						xtype: 'grid',
						width: 709,
						columns: [
							{
								get text() {
									return t('assignmentName');
								},
								dataIndex: 'name',
								flex: 1,
								resizable: false,
							},
							{
								get text() {
									return t('assigned');
								},
								dataIndex: 'assigned',
								xtype: 'datecolumn',
								width: 80,
								format: 'm/d',
								resizable: false,
							},
							{
								text: 'Due',
								dataIndex: 'due',
								xtype: 'datecolumn',
								width: 70,
								format: 'm/d',
								resizable: false,
							},
							{
								text: 'Completed',
								dataIndex: 'completed',
								width: 80,
								resizable: false,
								renderer: function (v) {
									return v && v.getTime() > 0
										? this.checkMarkTpl
										: '';
								},
							},
							{
								text: 'Score',
								dataIndex: 'grade',
								width: 70,
								resizable: false,
								doSort: function (state) {
									var store = this.up('grid').getStore(),
										sorter = new Ext.util.Sorter({
											direction: state,
											property: 'grade',
											root: 'data',
											sorterFn: StudentPerformance.getScoreSorter(),
										});

									store.sort(sorter);
								},
							},
							{
								text: 'Feedback',
								dataIndex: 'feedback',
								tdCls: 'feedback',
								width: 140,
								resizable: false,
								renderer: function (value, col, rec) {
									var grade = rec.get('Grade'),
										isExcused =
											grade && grade.get('IsExcused'),
										excusedTpl,
										excusedCls,
										feedbackTpl = value
											? Ext.util.Format.plural(
													value,
													'Comment'
											  )
											: '';

									excusedCls =
										isExcused === true ? 'on' : 'off';
									excusedTpl = Ext.DomHelper.markup({
										cls: 'grade-excused ' + excusedCls,
										html: getFormattedString(
											'NextThought.view.courseware.assessment.admin.Grid.excused'
										),
									});

									return excusedTpl + feedbackTpl;
								},
							},
						],

						listeners: {
							sortchange: function (ct, column) {
								ct.up('grid').markColumn(column);
							},
							selectionchange: function (sm, selected) {
								sm.deselect(selected);
							},
							viewready: function (grid) {
								grid.mon(
									grid.getView(),
									'refresh',
									function () {
										grid.markColumn(
											grid.down('gridcolumn[sortState]')
										);
									}
								);
							},
						},

						markColumn: function (c) {
							var cls = 'sortedOn',
								el = this.getEl();
							if (el) {
								el.select('.' + cls).removeCls(cls);
								if (c) {
									Ext.select(c.getCellSelector()).addCls(cls);
								}
							}
						},

						checkMarkTpl: Ext.DomHelper.markup({
							cls: 'check',
							html: '&#10003;',
						}),
					},
				],
			},
		],

		pathRoot: 'Grades & Performance',

		initComponent: function () {
			this.callParent(arguments);

			this.enableBubble(['goto-assignment', 'close-reader']);

			//this.chartGrade = this.down('grade-chart');
			//this.chartPerformance = this.down('grade-performance-chart');
			this.tempGrade = this.down('[grade]');
			this.gradeLabel = this.down('[gradeLabel]');
			this.tempCount = this.down('box[msgTpl]');
			this.grid = this.down('grid');

			//this.chartGrade.setGrade(80);

			var store = (this.store = new Ext.data.Store({
				fields: [
					{ name: 'ntiid', type: 'string' },
					{ name: 'containerId', type: 'string' },
					{ name: 'name', type: 'string' },
					{ name: 'assigned', type: 'date' },
					{ name: 'due', type: 'date' },
					{ name: 'completed', type: 'date' },
					{ name: 'Grade', type: 'auto' }, //object
					{ name: 'grade', type: 'auto' }, //value
					{ name: 'AverageGrade', type: 'int', mapping: 'average' }, //ignored for now
					{ name: 'feedback', type: 'int' },
					{ name: 'item', type: 'auto' },
					{ name: 'Submission', type: 'auto' },
					{ name: 'pendingAssessment', type: 'auto' },
					{ name: 'Feedback', type: 'auto' },
				],
				sorters: [{ property: 'due', direction: 'DESC' }],
			}));

			this.grid.bindStore(store);
			//this.chartPerformance.setStore(store);

			this.mon(this.grid, 'itemClick', 'fireGoToAssignment');

			this.mon(store, 'datachanged', 'updateHeader');
		},

		updateHeader: function () {
			function complete(o) {
				return !!o.get('completed');
			}

			var me = this,
				currentBundle = me.currentBundle,
				tpl = me.tempCount.msgTpl,
				count = me.store.getCount(),
				c = me.store.getRange().filter(complete).length,
				values;

			function addGrade(grade) {
				var elements = [];

				if (grade.value) {
					elements.push({
						tag: 'span',
						cls: 'score-grade',
						html: grade.value,
					});

					if (grade.letter) {
						elements.push('&nbsp;');
					}
				}

				if (grade.letter) {
					elements.push({
						tag: 'span',
						cls: 'letter-grade',
						html: grade.letter,
					});
				}

				me.tempGrade.update(Ext.DomHelper.markup(elements));
			}

			me.tempCount.update(Ext.String.format(tpl, c, count));

			if (me.finalGrade && !me.finalGrade.isEmpty()) {
				values = me.finalGrade.getValues();

				addGrade(values);

				me.gradeLabel.addDisclaimer(false);
			} else if (currentBundle) {
				currentBundle.getCurrentGrade().then(function (grade) {
					//if the final grade was set after getCurrentGrade was called
					//but before it finished make sure we don't unset it
					if (me.finalGrade && !me.finalGrade.isEmpty()) {
						return;
					}

					// DisplayableGrade takes precedent if present
					values = grade.get('DisplayableGrade')
						? { value: grade.get('DisplayableGrade') }
						: grade.getValues();

					addGrade(values);

					if (values.letter || values.value) {
						me.gradeLabel.addDisclaimer(
							'Estimated from the grading policy in the Syllabus'
						);
					}
				});
			}
		},

		clearAssignmentsData: function () {
			this.store.removeAll();
		},

		fireGoToAssignment: function (selModel, record) {
			var date = Ext.Date.format(
				record.get('assigned'),
				'l F j \\a\\t g:i A'
			);

			if (!record || record.get('assigned') > new Date()) {
				alert(
					getFormattedString(
						'NextThought.view.courseware.assessment.Performance.notyet',
						{ date: date }
					)
				);
				return;
			}

			this.navigateToObject(record.get('item'));
		},

		//This is a read-only view from the STUDENT'S perspective. READ: updates when students navigate to it.
		setAssignmentsData: function (assignments, currentBundle) {
			var raw = [],
				waitsOn = [],
				me = this;

			this.clearAssignmentsData();

			this.currentBundle = currentBundle;

			if (!assignments) {
				console.error('No assignments??');
				return Promise.reject('No Data?');
			}

			function collect(o) {
				var id = o.getId();

				waitsOn.push(
					assignments
						.getHistoryItem(o.getId(), true)
						.always(function (h) {
							if (typeof h === 'string') {
								h = null;
							}

							h = h && h.getMostRecentHistoryItem();

							var submission = h && h.get('Submission'),
								feedback = h && h.get('Feedback'),
								grade = h && h.get('Grade'),
								gradeValue = grade && grade.getValues().value,
								pendingAssessment =
									h && h.get('pendingAssessment');

							if (me.maybeSetFinalGrade(o, h, grade)) {
								return;
							}

							raw.push({
								ntiid: id,
								containerId: o.get('containerId'),
								item: o,
								name: o.get('title'),
								assigned: o.get('availableBeginning'),
								due: o.get('availableEnding'),
								completed:
									submission && submission.get('CreatedTime'),
								Grade: grade,
								grade: gradeValue,
								average: grade && grade.get('average'),
								Feedback: feedback,
								feedback:
									feedback && feedback.get('Items').length,
								pendingAssessment: pendingAssessment,
								Submission: submission,
							});
						})
				);
			}

			assignments.each(collect);

			return Promise.all(waitsOn)
				.then(function () {
					return raw;
				})
				.then(this.store.loadRawData.bind(this.store))
				.then(this.grid.view.refresh.bind(this.grid.view));
		},

		maybeSetFinalGrade: function (assignment, history, grade) {
			if (!Ext.String.endsWith(assignment.get('NTIID'), ':Final_Grade')) {
				return false;
			}

			try {
				this.finalGrade = grade;
				this.updateHeader();
				return true;
			} catch (e) {
				console.error(e.stack || e.message || e);
			}
		},
	}
));
