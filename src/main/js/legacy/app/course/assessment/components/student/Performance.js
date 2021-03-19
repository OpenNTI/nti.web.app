const Ext = require('@nti/extjs');
const { scoped } = require('@nti/lib-locale');
const Globals = require('internal/legacy/util/Globals');
const {
	getString,
	getFormattedString,
} = require('internal/legacy/util/Localization');

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

require('internal/legacy/mixins/Router');
require('internal/legacy/common/chart/Grade');
require('internal/legacy/common/chart/GradePerformance');

const StudentPerformance = (module.exports = exports = Ext.define(
	'NextThought.app.course.assessment.components.student.Performance',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.course-assessment-performance',

		statics: {
			getScoreSorter() {
				const get = o => {
					var grade = o.get('Grade'),
						values = grade && grade.getValues();

					return (values && values.value) || '';
				};

				return (a, b) => {
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
						addDisclaimer(disclaimer) {
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
								renderer(v) {
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
								doSort(state) {
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
								renderer(value, col, rec) {
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
							sortchange(ct, column) {
								ct.up('grid').markColumn(column);
							},
							selectionchange(sm, selected) {
								sm.deselect(selected);
							},
							viewready(grid) {
								grid.mon(grid.getView(), 'refresh', () => {
									grid.markColumn(
										grid.down('gridcolumn[sortState]')
									);
								});
							},
						},

						markColumn(c) {
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

		initComponent() {
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

		async updateHeader() {
			const complete = o => !!o.get('completed');

			var currentBundle = this.currentBundle,
				tpl = this.tempCount.msgTpl,
				count = this.store.getCount(),
				c = this.store.getRange().filter(complete).length,
				values;

			const addGrade = grade => {
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

				this.tempGrade?.show();
				this.tempGrade?.update(Ext.DomHelper.markup(elements));
			};

			this.tempCount.update(Ext.String.format(tpl, c, count));

			if (this.finalGrade && !this.finalGrade.isEmpty()) {
				values = this.finalGrade.getValues();

				addGrade(values);

				this.gradeLabel.show();
				this.gradeLabel.addDisclaimer(false);
				return;
			}

			if (!currentBundle) {
				return;
			}

			try {
				const grade = await currentBundle.getCurrentGrade();

				if (!grade && !this.finalGrade) {
					this.gradeLabel.hide();
					this.tempGrade.hide();
					return;
				}

				//if the final grade was set after getCurrentGrade was called
				//but before it finished make sure we don't unset it
				if (this.finalGrade && !this.finalGrade.isEmpty()) {
					return;
				}

				// DisplayableGrade takes precedent if present
				values = grade.get('DisplayableGrade')
					? { value: grade.get('DisplayableGrade') }
					: grade.getValues();

				addGrade(values);

				if (values.letter || values.value) {
					this.gradLabel.show();
					this.gradeLabel.addDisclaimer(
						'Estimated from the grading policy in the Syllabus'
					);
				}
			} catch (e) {
				if (!this.finalGrade) {
					this.gradeLabel.hide();
					this.tempGrade.hide();
					return;
				}

				if (e == null) {
					return;
				}

				if (e.message !== 'No Link') {
					throw e;
				}
			}
		},

		clearAssignmentsData() {
			this.store.removeAll();
		},

		fireGoToAssignment(selModel, record) {
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
		async setAssignmentsData(assignments, currentBundle) {
			const raw = [];

			this.clearAssignmentsData();

			this.currentBundle = currentBundle;

			await Promise.all(
				assignments?.map(async o => {
					const id = o.getId();
					try {
						let historyItem = await assignments
							.getHistoryItem(id, true)
							.catch(() => null);

						historyItem = historyItem?.getMostRecentHistoryItem?.();

						const submission = historyItem?.get('Submission');
						const feedback = historyItem?.get('Feedback');
						const grade = historyItem?.get('Grade');
						const gradeValue = grade?.getValues().value;
						const pendingAssessment = historyItem?.get(
							'pendingAssessment'
						);

						if (this.maybeSetFinalGrade(o, historyItem, grade)) {
							return;
						}

						raw.push({
							ntiid: id,
							containerId: o.get('containerId'),
							item: o,
							name: o.get('title'),
							assigned: o.get('availableBeginning'),
							due: o.get('availableEnding'),
							completed: submission?.get('CreatedTime'),
							Grade: grade,
							grade: gradeValue,
							average: grade?.get('average'),
							Feedback: feedback,
							feedback: feedback?.get('Items').length,
							pendingAssessment: pendingAssessment,
							Submission: submission,
						});
					} catch (e) {
						if (e == null) {
							return;
						}

						if (e.message !== 'No Link') {
							throw e;
						}
					}
				}) || []
			);

			this.store.loadRawData(raw);
			this.grid.view.refresh();
		},

		maybeSetFinalGrade(assignment, history, grade) {
			if (!Ext.String.endsWith(assignment.get('NTIID'), ':Final_Grade')) {
				return false;
			}

			this.finalGrade = grade;
			this.updateHeader();
			return true;
		},
	}
));
