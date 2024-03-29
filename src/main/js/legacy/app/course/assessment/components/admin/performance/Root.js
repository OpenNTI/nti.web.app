const Ext = require('@nti/extjs');
const { wait } = require('@nti/lib-commons');
const { scoped } = require('@nti/lib-locale');
const { getString } = require('internal/legacy/util/Localization');
const User = require('internal/legacy/model/User');
const Grade = require('internal/legacy/model/courseware/Grade');
const { swallow } = require('internal/legacy/util/Globals');

require('internal/legacy/mixins/grid-feature/GradeInputs');
require('internal/legacy/mixins/State');
require('../PagedGrid');
require('../ListHeader');

const t = scoped(
	'nti-web-app.course.assessment.components.admin.performance.Root',
	{
		ungraded: {
			one: '%(count)s Ungraded Assignment',
			other: '%(count)s Ungraded Assignments',
		},
		overdue: {
			one: '%(count)s Assignment Overdue',
			other: '%(count)s) Assignments Overdue',
		},
		itemFilters: {
			alloption: 'All Items',
			actionoption: 'Actionable Items',
			overoption: 'Overdue Items',
			unoption: 'Ungraded Items',
		},
	}
);

module.exports = exports = Ext.define(
	'NextThought.app.course.assessment.components.admin.performance.Root',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.course-assessment-admin-performance-root',

		mixins: {
			gridGrades: 'NextThought.mixins.grid-feature.GradeInputs',
			State: 'NextThought.mixins.State',
		},

		__inputSelector: '.gradebox input',
		ui: 'course-assessment',
		cls: 'course-assessment-admin performance',
		layout: 'none',
		viewRoot: true,

		items: [
			{
				xtype: 'box',
				autoEl: {
					cls: 'header',
					cn: [
						{
							cls: 'assignment-filterbar',
							cn: [
								{
									cls: 'third dropmenu student',
									cn: [
										{
											cls: 'label',
											html: getString(
												'NextThought.view.courseware.assessment.admin.performance.Root.allstudents'
											),
										},
									],
								},
								{
									cls: 'third dropmenu item',
									cn: [
										{
											cls: 'label',
											html: getString(
												'NextThought.view.courseware.assessment.admin.performance.Root.allitems'
											),
										},
									],
								},
								{
									cls: 'third search',
									cn: [
										{
											tag: 'input',
											type: 'text',
											placeholder: getString(
												'NextThought.view.courseware.assessment.admin.performance.Root.search'
											),
											required: 'required',
										},
										{ cls: 'clear' },
									],
								},
							],
						},
					],
				},
				renderSelectors: {
					studentEl: '.student',
					itemEl: '.item',
					inputEl: '.search input',
					clearEl: '.search .clear',
				},
			},
			{ xtype: 'course-assessment-admin-listheader' },
			{
				xtype: 'course-admin-paged-grid',
				columnOrder: ['Student', 'Username', 'PredictedGrade', 'Grade'],
				columnOverrides: {
					Student: {
						tpl: new Ext.XTemplate(
							Ext.DomHelper.markup([
								{
									cls: 'studentbox',
									cn: [
										'{User:avatar}',
										{
											cls: 'wrap',
											cn: [
												{
													cls: 'name',
													html: '{[this.displayName(values)]}',
												},
												{
													cls: 'action-items',
													cn: [
														{
															tag: 'tpl',
															if: 'OverdueAssignmentCount &gt; 0',
															cn: {
																cls: 'overdue',
																html: '{[this.displayOverdue(values)]}',
															},
														},
														{
															tag: 'tpl',
															if: 'UngradedAssignmentCount &gt; 0',
															cn: {
																cls: 'overdue',
																html: '{[this.displayUngraded(values)]}',
															},
														},
													],
												},
											],
										},
									],
								},
							]),
							{
								displayOverdue(values) {
									return t('overdue', {
										count: values.OverdueAssignmentCount,
									});
								},
								displayUngraded(values) {
									return t('ungraded', {
										count: values.UngradedAssignmentCount,
									});
								},
								displayName: function (values) {
									if (!values.User || !values.User.isModel) {
										return 'Resolving';
									}

									var creator = values.User,
										displayName =
											creator &&
											creator.get &&
											creator.get('displayName'),
										f =
											creator &&
											creator.get &&
											creator.get('FirstName'),
										l =
											creator &&
											creator.get &&
											creator.get('LastName'),
										lm,
										d = displayName;

									if (l) {
										lm = Ext.DomHelper.markup({
											tag: 'b',
											html: l,
										});
										d = displayName.replace(l, lm);
										if (d === displayName) {
											d +=
												' (' +
												(f ? f + ' ' : '') +
												lm +
												')';
										}
										d = Ext.DomHelper.markup({
											cls: 'accent-name',
											'data-qtip': d,
											html: d,
										});
									}

									return d;
								},
							}
						),
					},
					Grade: {
						dataIndex: 'FinalGrade',
						sortOn: 'Grade',
						width: 150,
						tpl: new Ext.XTemplate(
							Ext.DomHelper.markup([
								{
									tag: 'tpl',
									if: 'this.showGradebox(values)',
									cn: [
										{
											cls: 'gradebox',
											cn: [
												{
													tag: 'input',
													size: 3,
													tabindex: '1',
													type: 'text',
													value: '{[this.getGrade(values)]}',
												},
												{
													cls: 'dropdown letter grade',
													tabindex: '1',
													html: '{[this.getLetter(values)]}',
												},
											],
										},
									],
								},
							]),
							{
								showGradebox: function (values) {
									return values.AvailableFinalGrade;
								},
								getGrade: function (values) {
									var historyItem = values.HistoryItemSummary,
										grade =
											historyItem &&
											historyItem.get('Grade'),
										gradeVals =
											(grade && grade.getValues()) || {};

									return gradeVals.value || '';
								},

								getLetter: function (values) {
									var historyItem = values.HistoryItemSummary,
										grade =
											historyItem &&
											historyItem.get('Grade'),
										gradeVals =
											(grade && grade.getValues()) || {};

									return gradeVals.letter || '';
								},
							}
						),
					},
				},
				extraColumns: {
					PredictedGrade: {
						dataIndex: 'PredictedGrade',
						sortOn: 'PredictedGrade',
						width: 120,
						text: Ext.DomHelper.markup({
							cls: 'disclaimer-header',
							'data-qtip':
								'Estimated from the grading policy in the Syllabus',
							html: 'Projected Grade',
						}),
						renderer: function (val) {
							return Grade.getDisplay(val);
						},
					},
				},
			},
		],

		initComponent: function () {
			this.callParent(arguments);

			var me = this;

			this.store = this.assignments.getGradeSummaries();

			this.mon(this.store, 'load', this.maybeShowPredicted.bind(this));

			me.supported = true;
			me.grid = me.down('grid');
			me.pageHeader = me.down('course-assessment-admin-listheader');
			me.header = me.down('box');
			me.createGradeMenu();

			me.grid.bindStore(this.store);
			me.pageHeader.bindStore(this.store);
			me.pageHeader.currentBundle = me.currentBundle;

			me.mon(me.grid, {
				'load-page': me.loadPage.bind(me),
				sortchange: me.changeSort.bind(me),
			});

			me.mon(me.pageHeader, {
				'toggle-avatars': 'toggleAvatars',
				'page-change': function () {
					me.mon(me.store, {
						single: true,
						load: me.grid.scrollToTop.bind(me.grid),
					});
				},
				'load-page': me.loadPage.bind(me),
				'set-page-size': me.setPageSize.bind(me),
			});

			me.hidePredicted();

			$AppConfig.Preferences.getPreference('Gradebook').then(function (
				values
			) {
				me.pageHeader.setAvatarToggle(!values.get('hide_avatar'));
			});
		},

		onReactivated() {
			delete this.initialLoad;
			this.applyState(this.getStoreState());
		},

		restoreState: function (state, fromAfterRender) {
			//if this is coming form after render and we've already restored
			//a state don't overwrite it. The main reason this is here is so
			//if they hit the back button the component is already rendered with
			//a state so we want to override it, but if we are coming from after
			//render we don't want to override a previous state.
			if (fromAfterRender && this.stateRestored) {
				return Promise.resolve();
			}

			this.stateRestored = true;

			//TODO: show the populated list first
			this.studentFilter = state.studentFilter =
				state.studentFilter || 'Open'; //'All'
			this.itemFilter = state.itemFilter = state.itemFilter || 'all';
			this.searchKey = state.searchKey = state.searchKey || '';
			state.currentPage = state.currentPage || 1;

			return this.applyState(state || {});
		},

		/**
		 * If the store has already loaded and the record for the students is there don't do anything
		 * otherwise load the store to that student
		 *
		 * @param  {Object} state	state to restore
		 * @param  {string} student id of the student to restore to
		 * @returns {Promise}		 fulfills once the store is loaded with the student
		 */
		restoreStudent: function (state, student) {
			this.refresh();

			if (!this.initialLoad) {
				this.student = student;

				return this.restoreState(state);
			}

			var record;

			record = this.store.findBy(function (rec) {
				var user = rec.get('User');

				return (
					student === User.getIdFromRaw(user) && !rec.isPagingRecord
				);
			});

			if (record < 0) {
				this.student = student;
				return this.applyState(state);
			}

			return Promise.resolve();
		},

		hidePredicted: function () {
			this.grid.hideColumn('PredictedGrade');
		},

		maybeShowPredicted: function () {
			var rec = this.store.getRange()[0];

			if (rec && rec.raw.hasOwnProperty('PredictedGrade')) {
				this.grid.showColumn('PredictedGrade');
			}
		},

		afterRender: function () {
			this.callParent(arguments);

			var grid = this.grid,
				me = this;

			me.createStudentMenu();
			me.createItemMenu();

			if (this.assignments.hasFinalGrade()) {
				this.addCls('show-final-grade');
			}

			if (!me.monitorSubTree()) {
				console.warn(
					'Hiding Grade boxes because the browser does not support NutationObserver'
				);
				(me.supported = false), me.removeCls('show-final-grade');
			}

			me.updateExportEl(me.studentFilter);

			me.mon(me.header, {
				studentEl: { click: this.showStudentMenu.bind(this) },
				itemEl: { click: this.showItemMenu.bind(this) },
				inputEl: {
					keyup: this.changeNameFilter.bind(this),
					buffer: 350,
				},
				clearEl: { click: this.clearSearch.bind(this) },
			});

			me.mon(me.header, {
				inputEl: { keydown: this.maybeStopFilter.bind(this) },
			});

			me.mon(grid, {
				cellClick: this.onCellClick.bind(this),
			});

			if (!this.stateRestored) {
				//bump this to the next event pump so the restore state has a chance to be called
				wait().then(this.restoreState.bind(this, {}, true));
			}
		},

		maybeMask: function () {
			if (this.grid && this.grid.el) {
				this.grid.el.mask('Loading...');
			}
		},

		maybeUnmask: function () {
			if (this.grid && this.grid.el) {
				this.grid.el.unmask();
			}
		},

		toggleAvatars: function (show) {
			if (!this.rendered) {
				this.on('afterrender', this.toggleAvatars.bind(this, show));
				return;
			}

			if (show) {
				this.removeCls('hide-avatars');
			} else {
				this.addCls('hide-avatars');
			}

			$AppConfig.Preferences.getPreference('Gradebook').then(function (
				value
			) {
				value.set('hiade_avatars', !show);
				value.save();
			});
		},

		STUDENT_FILTERS: [
			{ text: 'All Students', type: 'All' },
			{
				text: getString(
					'NextThought.view.courseware.assessment.admin.performance.Root.open'
				),
				type: 'Open',
			},
			{
				text: getString(
					'NextThought.view.courseware.assessment.admin.performance.Root.enrolled'
				),
				type: 'ForCredit',
			},
		],

		createStudentMenu: function () {
			var type = this.studentFilter || 'Open', // 'All',
				items = this.STUDENT_FILTERS.map(function (filter) {
					filter.checked = type === filter.type;
					return filter;
				});

			this.studentMenu = Ext.widget('menu', {
				cls: 'group-by-menu',
				width: 257,
				ownerCmp: this,
				constrainTo: Ext.getBody(),
				offset: [0, 0],
				defaults: {
					ui: 'nt-menuitem',
					xtype: 'menucheckitem',
					group: 'groupByOptions',
					cls: 'group-by-option',
					height: 50,
					plain: true,
					listeners: {
						scope: this,
						checkchange: 'switchStudent',
					},
				},
				items: items,
			});
			this.studentMenu.show().hide();
			this.studentMenu.initialType = type;
		},

		showStudentMenu: function () {
			if (this.applyingState || this.stateDisabled) {
				return;
			}

			this.studentMenu.showBy(
				this.header.studentEl,
				'tl-tl?',
				this.studentMenu.offset
			);
		},

		updateStudentUI: function (item) {
			var offset, x;

			try {
				offset = item.getOffsetsTo(this.studentMenu);
				x = offset && offset[1];
				this.header.studentEl.el.down('.label').update(item.text);
			} catch (e) {
				swallow(e);
			}

			this.studentMenu.offset = [0, x ? -x : 0];

			this.grid[item.type === 'ForCredit' ? 'showColumn' : 'hideColumn'](
				'Username'
			);

			this.updateExportEl(item.type);
		},

		switchStudent: function (item, status, opts, noEmpty) {
			if (!status) {
				return;
			}

			this.studentFilter = item.type;
			this.currentPage = 1;

			this.maybeSwitch(noEmpty);
			this.updateFilter();
			if (this.pageHeader.onStudentFilterChange) {
				this.pageHeader.onStudentFilterChange(this.studentFilter);
			}
		},

		maybeSwitchStudents: function () {
			if (this.initialLoad || this.store.getCount() > 0) {
				return;
			}

			if (!this.rendered) {
				this.on('afterrender', this.maybeSwitchStudents.bind(this));
				return;
			}

			var scope = this.store.proxy.reader.EnrollmentScope,
				menu = this.studentMenu,
				open = menu.down('[type=Open]'),
				credit = menu.down('[type=ForCredit]');

			if (scope === 'ForCredit') {
				open.setChecked(true);
			} else {
				credit.setChecked(true);
			}
		},

		maybeSwitch: function (noEmpty) {
			var menu = this.studentMenu,
				item = menu.down('[checked]'),
				initial = menu.initialType;

			if (item && item.type === initial) {
				this.store.on({
					single: true,
					load: function (s) {
						if (!s.getCount() && noEmpty) {
							item = menu.down('menuitem:not([checked])');
							if (item) {
								item.setChecked(true);
							}
						}
					},
				});
			}
		},

		updateExportEl: function (type) {
			var gradebook = this.assignments.getGradeBook(),
				url,
				base = gradebook && gradebook.getLink('ExportContents');

			if (!base) {
				this.pageHeader.setExportURL();
				return;
			}

			if (type === 'All') {
				url = base;
				this.pageHeader.setExportURL(
					url,
					getString(
						'NextThought.view.courseware.assessment.admin.performance.Root.exportall'
					)
				);
			} else if (type === 'Open') {
				url = base + '?LegacyEnrollmentStatus=Open';
				this.pageHeader.setExportURL(
					url,
					getString(
						'NextThought.view.courseware.assessment.admin.performance.Root.exportopen'
					)
				);
			} else {
				url = base + '?LegacyEnrollmentStatus=ForCredit';
				this.pageHeader.setExportURL(
					url,
					getString(
						'NextThought.view.courseware.assessment.admin.performance.Root.exportenrolled'
					)
				);
			}
		},

		ITEM_FILTERS: [
			{
				get text() {
					return t('itemFilters.alloption');
				},
				type: 'all',
			},
			{
				get text() {
					return t('itemFilters.actionoption');
				},
				type: 'actionable',
			},
			{
				get text() {
					return t('itemFilters.overoption');
				},
				type: 'overdue',
			},
			{
				get text() {
					return t('itemFilters.unoption');
				},
				type: 'ungraded',
			},
		],

		createItemMenu: function () {
			var type = this.itemFilter,
				items = this.ITEM_FILTERS.map(function (filter) {
					filter.checked = type === filter.type;
					return filter;
				});

			this.itemMenu = Ext.widget('menu', {
				cls: 'group-by-menu',
				width: 257,
				ownerCmp: this,
				constrainTo: Ext.getBody(),
				offset: [0, 0],
				defaults: {
					ui: 'nt-menuitem',
					xtype: 'menucheckitem',
					group: 'groupByOptions',
					cls: 'group-by-option',
					height: 50,
					plain: true,
					listeners: {
						scope: this,
						checkchange: 'switchItem',
					},
				},
				items: items,
			});

			this.itemMenu.show().hide();
		},

		showItemMenu: function () {
			if (this.applyingState || this.stateDisabled) {
				return;
			}

			this.itemMenu.showBy(
				this.header.itemEl,
				'tl-tl?',
				this.itemMenu.offset
			);
		},

		updateItemUI: function (item) {
			var offset = item && item.getOffsetsTo(this.itemMenu),
				x = offset ? offset[1] : 1;

			this.header.itemEl.el.down('.label').update(item.text);

			this.itemMenu.offset = [0, x ? -x : 0];
		},

		switchItem: function (item, status) {
			if (!status) {
				return;
			}

			this.itemFilter = item.type;

			this.updateFilter();
		},

		maybeStopFilter: function (e) {
			if (this.applyingState || this.stateDisabled) {
				e.stopEvent();
			}
		},

		changeNameFilter: function () {
			if (this.applyingState || this.stateDisabled) {
				return;
			}

			this.searchKey = this.header.inputEl.getValue();
			this.updateFilter(true);
		},

		clearSearch: function () {
			this.searchKey = '';
			this.header.inputEl.dom.value = '';
			this.updateFilter();
		},

		clearState: function () {
			this.stateDisabled = true;
			this.clearSearch();
			this.stateDisabled = false;
			this.currentState = {};
		},

		setSearch: function (val) {
			this.searchKey = val;

			if (this.header && this.header.inputEl && this.header.inputEl.dom) {
				this.header.inputEl.dom.value = val;
			}
		},

		updateUIFromState: function () {
			if (!this.rendered) {
				this.on('afterrender', this.updateUIFromState.bind(this));
				return;
			}

			var student = this.studentMenu.down(
					'[type="' + this.studentFilter + '"]'
				),
				item = this.itemMenu.down('[type="' + this.itemFilter + '"]');

			if (student) {
				student.setChecked(true, true);
				this.updateStudentUI(student);
			}

			if (item) {
				item.setChecked(true, true);
				this.updateItemUI(item);
			}

			this.header.inputEl.dom.value = this.searchKey || '';
		},

		refresh: function () {
			var view = this.grid.view;

			view.refresh();
		},

		getStoreState: function () {
			var store = this.store,
				sorters = this.store.sorters && this.store.sorters.items,
				sorter = (sorters && sorters[0]) || {},
				params = store.proxy.extraParams,
				filters = params.filter ? params.filter.split(',') : [],
				studentFilters,
				itemFilters;

			studentFilters = this.STUDENT_FILTERS.reduce(function (
				acc,
				filter
			) {
				acc[filter.type] = true;
				return acc;
			},
			{});

			itemFilters = this.ITEM_FILTERS.reduce(function (acc, filter) {
				acc[filter.type] = true;
				return acc;
			}, {});

			studentFilters = filters.filter(function (filter) {
				return studentFilters[filter];
			});

			itemFilters = filters.filter(function (filter) {
				return itemFilters[filter];
			});

			return {
				currentPage: store.currentPage,
				pageSize: store.pageSize,
				searchKey: params.search || '',
				filters: params.filter ? params.filter.split(',') : [],
				itemFilter: itemFilters[0],
				studentFilter: studentFilters[0],
				sort: {
					prop: sorter.property || '',
					direction: sorter.direction || '',
				},
			};
		},

		isSameState: function (state) {
			var storeState = this.getStoreState(),
				isEqual = true;

			if (state.pageSize && state.pageSize !== storeState.pageSize) {
				isEqual = false;
			} else if (state.currentPage !== storeState.currentPage) {
				isEqual = false;
			} else if ((state.searchKey || '') !== storeState.searchKey) {
				isEqual = false;
			} else if (storeState.studentFilter !== state.studentFilter) {
				isEqual = false;
			} else if (storeState.itemFilter !== state.itemFilter) {
				isEqual = false;
			} else if (
				state.sort &&
				(state.sort.prop !== storeState.sort.prop ||
					state.sort.direction !== storeState.sort.direction)
			) {
				isEqual = false;
			} else if (
				(state.student && state.student !== this.student) ||
				(!state.student && this.student)
			) {
				isEqual = false;
			}

			return isEqual;
		},

		setDisabled: function () {
			this.stateDisabled = true;

			if (this.header) {
				this.header.addCls('disabled');
			}

			if (this.pageHeader) {
				this.pageHeader.setDisabled();
			}

			if (this.grid) {
				this.grid.setDisabled();
			}
		},

		setEnabled: function () {
			delete this.stateDisabled;
			this.header.removeCls('disabled');
			this.pageHeader.setEnabled();
			this.grid.setEnabled();
		},

		applyState: function (state) {
			//if we are already applying state or the state hasn't changed and the store has loaded don't do anything
			if (this.applyingState) {
				return Promise.resolve();
			}

			if (this.isSameState(state) && this.initialLoad) {
				this.refresh();
				return Promise.resolve();
			}

			var me = this,
				store = me.store,
				filters = [],
				params = store.proxy.extraParams || {},
				studentFilter;

			me.applyingState = true;
			me.setDisabled();
			state = state || {};
			studentFilter =
				state.studentFilter || this.studentFilter || 'ForCredit';

			filters.push(studentFilter);

			if (state.itemFilter && !/all/i.test(state.itemFilter)) {
				filters.push(state.itemFilter);
			}

			params.filter = filters.join(',');

			if (state.searchKey) {
				params.search = state.searchKey;
			} else {
				delete params.search;
			}

			if (state.sort && state.sort.prop) {
				store.sort(state.sort.prop, state.sort.direction, null, false);
			}

			if (me.student || state.student) {
				if (params.filter === 'All') {
					params.batchContainingUsername =
						me.student || state.student;
				} else {
					params.batchContainingUsernameFilterByScope =
						me.student || state.student;
				}
			}

			if (state.pageSize) {
				store.setPageSize(state.pageSize);
			} else {
				store.setPageSize(50);
			}

			this.currentState = state;

			return new Promise(function (fulfill, reject) {
				me.mon(store, {
					single: true,
					'records-filled-in': function () {
						delete store.proxy.extraParams
							.batchContainingUsernameFilterByScope;
						delete store.proxy.extraParams.batchContainingUsername;
						delete me.student;
						delete me.applyingState;
						me.setEnabled();

						me.currentPage = store.getCurrentPage();
						me.maybeSwitchStudents();
						me.updateUIFromState();
						me.initialLoad = true;

						if (state.searchKey) {
							me.setSearch(state.searchKey);
						}

						if (store.hasFinalGrade()) {
							me.grid.showColumn('Grade');
						} else {
							me.grid.hideColumn('Grade');
						}

						fulfill();
					},
				});

				if (
					params.batchContainingUsernameFilterByScope ||
					params.batchContainingUsername
				) {
					store.load();
				} else if (state.currentPage) {
					store.loadPage(parseInt(state.currentPage, 10));
				} else {
					store.loadPage(1);
				}
			});
		},

		updateFilter: function (resetPage) {
			var state = Ext.clone(this.currentState) || {},
				newPage = state.currentPage !== this.currentPage;

			if (this.stateDisabled) {
				return;
			}

			if (this.studentFilter) {
				state.studentFilter = this.studentFilter;
			} else {
				delete state.studentFilter;
			}

			if (this.itemFilter) {
				state.itemFilter = this.itemFilter;
			} else {
				delete state.itemFilter;
			}

			if (this.searchKey) {
				state.searchKey = this.searchKey;
				if (this.currentPage && this.currentPage > 1 && resetPage) {
					this.currentPage = 1;
				}
			} else {
				delete state.searchKey;
			}

			if (this.currentPage) {
				state.currentPage = this.currentPage;
			} else {
				delete state.currentPage;
			}

			if (this.pageSize) {
				state.pageSize = this.pageSize;
			} else {
				delete state.pageSize;
			}

			if (this.sort && this.sort.prop) {
				state.sort = this.sort;
			} else {
				delete state.sort;
			}

			if (newPage) {
				this.pushRouteState(state);
			} else {
				this.replaceRouteState(state);
			}
		},

		loadPage: function (page) {
			this.currentPage = page;

			this.updateFilter();
		},

		changeSort: function (ct, column, direction) {
			if (this.stateDisabled || this.applyingState) {
				return false;
			}

			var prop = column.sortOn || column.dataIndex;

			if (prop) {
				this.sort = {
					prop: prop,
					direction: direction,
				};
			} else {
				this.sort = {};
			}

			if (!this.applyingState) {
				this.updateFilter();
			}

			return false;
		},

		setPageSize: function (pageSize) {
			this.pageSize = pageSize;

			this.updateFilter();
		},

		clear: function () {
			//this.store.removeAll();
		},

		clearAssignmentsData: function () {
			this.clear();
		},
		updateActionables: function (username) {},

		getNode: function (record) {
			var v = this.grid.getView();
			return v.getNode.apply(v, arguments);
		},

		getRecord: function (node) {
			var v = this.grid.getView();
			return v.getRecord.apply(v, arguments);
		},

		getFocusedInput: function () {
			var input = document.querySelector(':focus');

			function toSelector(tag) {
				var s = tag.tagName,
					cls = tag.className.replace(/\W+/g, '.');
				return Ext.isEmpty(cls) ? s : s + '.' + cls;
			}

			return (
				input && {
					record: this.getRecord(
						Ext.fly(input).up(this.__getGridView().itemSelector)
					),
					tag: toSelector(input),
				}
			);
		},

		setFocusedInput: function (info) {
			var record = info && info.record,
				tag = info && info.tag,
				n = record && this.__getGridView().getNode(record);
			return (
				n &&
				wait(1).then(function () {
					n = n.querySelector(tag);
					if (n) {
						n.focus();
					}
				})
			);
		},

		//</editor-fold>

		//<editor-fold desc="Event Handlers">
		__getGridView: function () {
			return this.grid.getView();
		},

		onCellClick: function (me, td, cellIndex, record, tr, rowIndex, e) {
			var isControl = !!e.getTarget('.gradebox'),
				user;

			if (isControl && e.type === 'click') {
				try {
					if (e.getTarget('.dropdown')) {
						this.onDropDown(td, record);
					}
				} finally {
					e.stopPropagation();
				}
				return;
			}

			user = record.get('User');

			this.showAssignmentsForStudent(user);
		},

		createGradeMenu: function () {
			this.gradeMenu = Ext.widget('menu', {
				cls: 'letter-grade-menu',
				width: 67,
				minWidth: 67,
				ownerCmp: this,
				offset: [-1, -1],
				defaults: {
					ui: 'nt-menuitem',
					xtype: 'menucheckitem',
					group: 'gradeOptions',
					cls: 'letter-grade-option',
					height: 35,
					plain: true,
					listeners: {
						scope: this,
						checkchange: 'changeLetterGrade',
					},
				},
				//Don't know if these need to be translated
				items: Grade.getLetterItems(),
			});
		},

		onDropDown: function (node, record) {
			var me = this,
				rec = record || me.grid.getRecord(node),
				el = Ext.get(node),
				dropdown = el && el.down('.gradebox .letter');

			me.gradeMenu.items.each(function (item, index) {
				var x = item.height * index;

				if (item.text === rec.get('letter')) {
					item.setChecked(true, true);
					me.gradeMenu.offset = [-1, -x];
					// current = item;
				} else {
					item.setChecked(false, true);
				}
			});

			if (dropdown) {
				me.activeGradeRecord = rec;
				me.gradeMenu.showBy(dropdown, 'tl-tl', me.gradeMenu.offset);
			}
		},

		changeLetterGrade: function (item, status) {
			if (!this.activeGradeRecord || !status) {
				return;
			}
			var g = this.activeGradeRecord.get('grade'),
				n = this.getNode(this.activeGradeRecord);

			n = n && n.querySelector('.gradebox input');

			if (n && n.value !== g) {
				g = n.value;
			}

			this.editGrade(this.activeGradeRecord, g, item.text);
		},

		editGrade: function (record, value, letter) {
			var me = this,
				view = me.__getGridView(),
				node = view.getNode(record),
				historyItem = record.get('HistoryItemSummary'),
				grade = historyItem.get('Grade'),
				oldValues = grade && grade.getValues();

			//if a letter has not been passed use the old one
			if (!letter) {
				letter = oldValues && oldValues.letter;
			}

			if (!historyItem || !historyItem.shouldSaveGrade(value, letter)) {
				return;
			}

			if (node) {
				Ext.fly(node).setStyle({ opacity: '0.3' });
			}

			me.setDisabled();

			wait(300)
				.then(function () {
					return historyItem.saveGrade(value, letter);
				})
				.always(function () {
					var n = view.getNode(record);

					if (n) {
						Ext.fly(n).setStyle({ opacity: 1 });
					}

					me.setEnabled();
				});
		},
	}
);
