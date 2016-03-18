var Ext = require('extjs');
var User = require('../../../../../../model/User');
var ParseUtils = require('../../../../../../util/Parsing');
var ComponentCustomTemplate = require('../../../../../../layout/component/CustomTemplate');
var UxFilterMenu = require('../../../../../../common/ux/FilterMenu');
var AdminListHeader = require('../ListHeader');
var AdminPagedGrid = require('../PagedGrid');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.admin.assignments.Assignment', {
    extend: 'Ext.container.Container',
    alias: 'widget.course-assessment-admin-assignments-item',
    state_key: 'admin-assignment-students',
    ui: 'course-assessment',
    cls: 'course-assessment-header assignment-item',
    layout: 'none',
    componentLayout: 'customtemplate',
    childEls: ['body'],
    getTargetEl: function() { return this.body; },
    pathRoot: 'Assignments',

    renderTpl: Ext.DomHelper.markup([
		//toolbar
		{
			cls: 'toolbar',
			cn: [
				{ cls: 'right controls', cn: [
					{ cls: 'page', cn: [
						{tag: 'tpl', 'if': 'page', cn: [{ tag: 'span', html: '{page}'}, ' {{{NextThought.view.courseware.assessment.assignments.admin.Assignment.of}}} ']},
						{tag: 'tpl', 'if': '!page', cn: ['{{{NextThought.view.courseware.assessment.assignments.admin.Assignment.total}}} ']},
						{tag: 'span', cls: 'total', html: '{total}'}
					] },
					{ cls: 'up {noPrev:boolStr("disabled")}' },
					{ cls: 'down {noNext:boolStr("disabled")}' }
				] },
				//path (bread crumb)
				{
					cn: [
						{ tag: 'span', cls: 'path part root', html: '{pathRoot}'},
						' / ',
						{ tag: 'span', cls: 'path part current', html: '{pathBranch}'}
					]
				}
			]
		},
		{ id: '{id}-body', cls: 'x-panel-body body', cn: ['{%this.renderContainer(out,values)%}'] }
	]),

    renderSelectors: {
		toolbarEl: '.toolbar',
		rootPathEl: '.toolbar .path.part.root',
		previousEl: '.toolbar .controls .up',
		nextEl: '.toolbar .controls .down',
		totalEl: '.toolbar .controls .page .total',
		changeDateEl: '.header .controls .email',
		filtersEl: '.header span.filters',
		avatarEl: '.header span.toggle-avatar',
		reportsEl: '.header .controls .reports',
		pagerEl: '.header .pager-wrapper'
	},

    listeners: {
		rootPathEl: { click: 'fireGoUp' },
		previousEl: { click: 'firePreviousEvent' },
		nextEl: { click: 'fireNextEvent' }
	},

    items: [
		{xtype: 'course-assessment-admin-listheader'},
		{
			xtype: 'course-admin-paged-grid',
			cls: 'student-assignment-overview admin-paged-grid',
			columnOrder: ['Student', 'Username', 'Completed', 'Grade', 'Feedback', 'Submission'],
			columnOverrides: {
				Student: {padding: '0 0 0 30'},
				Grade: {
					text: getString('NextThought.view.courseware.assessment.admin.Grid.score'),
					componentCls: 'score',
					tdCls: 'text score',
					width: 110,
					tpl: new Ext.XTemplate(Ext.DomHelper.markup([
						{cls: 'gradebox', cn: [
							{tag: 'input', size: 3, tabindex: '1', type: 'text', value: '{[this.getGrade(values)]}'},
							{ tag: 'tpl', 'if': 'this.isGradeExcused(values)', cn: [
								{
									tag: 'span', cls: 'grade-excused',
									html: getFormattedString('NextThought.view.courseware.assessment.admin.Grid.excused')
								}
							]}
						]}
						]), {
							getGrade: function(values) {
								var historyItem = values.HistoryItemSummary,
									grade = historyItem && historyItem.get('Grade'),
									gradeVals = (grade && grade.getValues()) || {};

								return gradeVals.value || '';
							},

							isGradeExcused: function(values) {
								var historyItem = values.HistoryItemSummary,
									grade = historyItem && historyItem.get('Grade');

								return grade && grade.get('IsExcused');
							}
						}
					)
				}
			}
		},
		{
			xtype: 'filter-menupanel',
			searchPlaceHolderText: getString('NextThought.view.courseware.assessment.assignments.admin.Assignment.search'),
			filters: [
				{ text: getString('NextThought.view.courseware.assessment.assignments.admin.Assignment.enrolled'), filter: 'ForCredit'},
				{ text: getString('NextThought.view.courseware.assessment.assignments.admin.Assignment.open'), filter: 'Open'}
			]
		}
	],

    constructor: function(config) {
		this.items = Ext.clone(this.items);
		this.callParent(arguments);
	},

    initComponent: function() {
		this._masked = 0;
		this.callParent(arguments);

		var me = this,
			pageHeader = me.down('course-assessment-admin-listheader'),
			grid = me.down('grid');

		me.filterMenu = this.down('filter-menupanel');

		me.mon(me.filterMenu, {
			filter: 'doFilter',
			search: {fn: 'doSearch', buffer: 450}
		});

		me.store = me.assignments.getAssignmentHistory(me.assignment);

		me.mon(me.store, {
			beforeload: 'mask',
			load: 'onStoreLoad'
		});

		grid.bindStore(me.store);
		grid.dueDate = me.assignment.getDueDate();
		grid.beforeEdit = me.setDisabled.bind(me);
		grid.afterEdit = me.setEnabled.bind(me);

		me.mon(grid, {
			'load-page': me.loadPage.bind(me),
			'sortchange': me.changeSort.bind(me),
			'itemclick': me.onItemClick.bind(me)
		});

		//if there is a completed column but no parts on the assignment
		//hide the completed column
		if (me.assignment.isEmpty()) {
			grid.hideColumn('Completed');
		}

		$AppConfig.Preferences.getPreference('Gradebook')
			.then(function(value) {
				pageHeader.setAvatarToggle(!value.get('hide_avatars'));
			});

		if (me.student) {
			me.store.proxy.extraParams = Ext.apply(me.store.proxy.extraParams || {}, {
				batchContainingUsernameFilterByScope: me.student
			});
		}

		me.pageHeader = pageHeader;

		me.pageHeader.setAssignment(me.assignment);
		me.pageHeader.bindStore(me.store);

		me.mon(pageHeader, {
			'toggle-avatars': 'toggleAvatars',
			'page-change': function() {
				me.mon(me.store, {
					single: true,
					'load': grid.scrollToTop.bind(grid)
				});
			},
			'load-page': me.loadPage.bind(me),
			'set-page-size': me.setPageSize.bind(me)
		});
	},

    restoreState: function(state, fromAfterRender) {
		//if this is coming form after render and we've already restored
		//a state don't overwrite it. The main reason this is here is so
		//if they hit the back button the component is already rendered with
		//a state so we want to override it, but if we are coming from after
		//render we don't want to override a previous state.
		if (fromAfterRender && this.stateRestored) {
			return Promise.resolve();
		}

		state.currentPage = state.currentPage || 1;

		this.current_state = state || {};
		this.stateRestored = true;

		return this.applyState(this.current_state);
	},

    /**
	 * If the store has already loaded and the record for the students is there don't do anything
	 * otherwise load the store to that student
	 *
	 * @param  {Object} state   state to restore
	 * @param  {String} student id of the student to restore to
	 * @return {Promise}         fulfills once the store is loaded with the student
	 */
	restoreStudent: function(state, student) {
		if (!this.initialLoad) {
			this.student = student;

			return this.restoreState(state);
		}

		var record;

		record = this.store.findBy(function(rec) {
			var user = rec.get('User');

			return student === NextThought.model.User.getIdFromRaw(user);
		});

		if (record < 0) {
			this.student = student;
			return this.applyState(state);
		}

		return Promise.resolve();
	},

    beforeRender: function() {
		this.callParent(arguments);

		this.pathBranch = this.assignmentTitle;

		this.renderData = Ext.apply(this.renderData || {}, {
			pathRoot: this.pathRoot,
			pathBranch: this.pathBranch,
			page: this.pageSource.getPageNumber(),
			noPrev: !this.pageSource.hasPrevious(),
			noNext: !this.pageSource.hasNext()
		});
	},

    afterRender: function() {
		this.callParent(arguments);

		var pager;

		this.el.query('a.button').forEach(this._setupButtons);

		if (this._masked) {
			this._showMask();
		}

		this.syncFilterToUI(true);

		this.onPagerUpdate();

		this.mon(this.pageHeader, {
			'showFilters': this.onFiltersClicked.bind(this),
			'goToRawAssignment': this.goToRawAssignment.bind(this)
		});

		if (!this.stateRestored) {
			//bump this to the next event pump so the restore state has a change to be called
			wait().then(this.restoreState.bind(this, {}, true));
		}
	},

    syncFilterToUI: function(firstPass) {
		if (!this.rendered) {
			this.on('afterrender', this.syncFilterToUI.bind(this, firstPass));
			return;
		}

		var filter = this.store.getEnrollmentScope(),
			search = this.searchTerm;

		this.updateColumns(filter);

		this.filterMenu.setState(filter, search || '');

		this.updateFilterCount();

		if (firstPass) {
			this.filterMenu.initialState = filter;
			this.maybeSwitch();
		}
	},

    maybeSwitch: function() {
		var menu = this.filterMenu,
			s = this.store,
			item = menu.down('[checked]'),
			initial = menu.initialState;

		function loaded(s) {
			if (!s.getCount()) {
				item = menu.down('filter-menu-item:not([checked])');

				if (item) {
					item.setChecked(true);
				}
			}
		}

		if (item && item.filter === initial) {
			if (!s.loading && s.loaded) {
				loaded(s);
			} else {
				s.on({single: true, loaded: loaded});
			}
		}
	},

    _setupButtons: function(el) {
		var tip = el.textContent;

		Ext.fly(el).set({
			title: tip,
			'data-qtip': tip
		});
	},

    toggleAvatarsClicked: function(e) {
		this.toggleAvatars(!e.getTarget('.enabled'));
	},

    toggleAvatars: function(show) {
		if (!this.rendered) {
			this.on('afterrender', this.toggleAvatars.bind(this, show));
			return;
		}

		this[show ? 'removeCls' : 'addCls']('hide-avatars');

		$AppConfig.Preferences.getPreference('Gradebook')
			.then(function(value) {
				value.set('hide_avatars', !show);
				value.save();
			});
	},

    updateFilterCount: function() {
		if (!this.rendered) {
			this.on('afterrender', this.updateFilterCount.bind(this));
			return;
		}

		this.pageHeader.updateFilterCount(this.filterMenu.getFilterLabel(this.store.getTotalCount()));
	},

    onPagerUpdate: function() {
		if (!this.rendered) {
			this.on({afterrender: 'onPagerUpdate', single: true});
			return;
		}

		if (this.pageSource.hasNext()) {
			this.nextEl.removeCls('disabled');
		}

		if (this.pageSource.hasPrevious()) {
			this.previousEl.removeCls('disabled');
		}

		this.totalEl.update(this.pageSource.getTotal());
	},

    _showMask: function() {
		var me = this,
			el = me.el;

		me._maskIn = setTimeout(function() {
			var gridMask = (me.down('gridview') || {}).loadMask;

			if (gridMask && !gridMask.isDestroyed) {
				gridMask.addCls('masked-mask');
			}

			if (el && el.dom) {
				el.mask(getString('NextThought.view.courseware.assessment.assignments.admin.Assignment.loading'), 'loading', true);
			}
		}, 1);
	},

    mask: function() {
		this._masked++;

		if (this.rendered) {
			this._showMask();
		}
	},

    unmask: function() {
		this._masked--;

		var gridMask = (this.down('gridview') || {}).loadMask;

		if (this._masked <= 0) {
			this._masked = 0;

			clearTimeout(this._maskIn);

			if (gridMask && !gridMask.isDestroyed && gridMask.removeCls) {
				gridMask.removeCls('masked-mask');
			}

			if (this.el && this.el.dom) {
				this.el.unmask();
			}
		}
	},

    scrollToRecord: function(record) {
		var grid = this.down('grid'),
			index = this.store.indexOf(record),
			node = grid && index >= 0 && grid.view.getNodeByRecord(record);

		node = node && Ext.get(node);

		if (node) {
			node.scrollIntoView(grid.view.el, false);
		}
	},

    refresh: function() {
		var grid = this.down('grid');

		grid.view.refresh();
	},

    getStoreState: function() {
		var store = this.store,
			sorters = this.store.sorters && this.store.sorters.items,
			sorter = (sorters && sorters[0]) || {},
			params = store.proxy.extraParams;

		return {
			currentPage: store.currentPage,
			pageSize: store.pageSize,
			searchTerm: params.search || '',
			filter: params.filter || '',
			sort: {
				prop: sorter.property || '',
				direction: sorter.direction || ''
			}
		};
	},

    isSameState: function(state) {
		var storeState = this.getStoreState(),
			isEqual = true;

		if (state.pageSize && state.pageSize !== storeState.pageSize) {
			isEqual = false;
		} else if (state.currentPage !== storeState.currentPage) {
			isEqual = false;
		} else if ((state.searchTerm || '') !== storeState.searchTerm) {
			isEqual = false;
		} else if (state.filter !== storeState.filter) {
			isEqual = false;
		} else if (state.sort && (state.sort.prop !== storeState.sort.prop || state.sort.direction !== storeState.sort.direction)) {
			isEqual = false;
		} else if ((state.student && state.student !== this.student) || (!state.student && this.student)) {
			isEqual = false;
		}

		return isEqual;
	},

    setDisabled: function() {
		var grid = this.down('grid');

		this.stateDisabled = true;
		if (this.toolbarEl) {
			this.toolbarEl.addCls('disabled');
		}

		this.pageHeader.setDisabled();
		grid.setDisabled();
	},

    setEnabled: function() {
		var grid = this.down('grid');

		delete this.stateDisabled;
		if (this.toolbarEl) {
			this.toolbarEl.removeCls('disabled');
		}

		this.pageHeader.setEnabled();
		grid.setEnabled();
	},

    applyState: function(state) {
		//if we are already applying state or the state hasn't changed and the store has loaded don't do anything
		if (this.applyingState) { return Promise.resolve(); }

		if (this.isSameState(state) && this.initialLoad) {
			this.refresh();
			return Promise.resolve();
		}

		var me = this,
			store = me.store,
			params = store.proxy.extraParams || {};

		me.applyingState = true;
		me.setDisabled();

		if (!state || state.filter) {
			params.filter = me.currentFilter = state.filter || 'ForCredit';
		} else {
			delete params.filter;
		}

		state = state || {};

		if (state.pageSize) {
			store.setPageSize(state.pageSize);
		}

		if (state.sort && state.sort.prop) {
			store.sort(state.sort.prop, state.sort.direction, null, false);
		}

		if (state.searchTerm) {
			params.search = state.searchTerm;
		} else {
			delete params.search;
		}

		if (this.student) {
			if (params.filter === 'All') {
				params.batchContainingUsername = this.student;
			}
			else {
				params.batchContainingUsernameFilterByScope = this.student;
			}
		}

		return new Promise(function(fulfill, reject) {
			me.mon(store, {
				single: true,
				'records-filled-in': function() {
					delete store.proxy.extraParams.batchContainingUsernameFilterByScope;
					delete store.proxy.extraParams.batchContainingUsername;
					delete me.student;

					me.currentPage = store.getCurrentPage();
					me.maybeSwitch();
					me.initialLoad = true;
					me.unmask();

					if (state.searchTerm) {
						me.setSearch(state.searchTerm);
					}

					delete me.applyingState;
					me.setEnabled();

					me.syncFilterToUI();

					fulfill();
				}
			});

			if (params.batchContainingUsernameFilterByScope || params.batchContainingUsername) {
				store.load();
			} else if (state.currentPage) {
				store.loadPage(parseInt(state.currentPage, 10));
			} else {
				store.loadPage(1);
			}
		});
	},

    onStoreLoad: function() {
		this.syncFilterToUI();
		this.unmask();
		this.alignNavigation();

		return;
	},

    updateColumns: function(filter) {
		var grid = this.down('grid');

		if (filter === 'ForCredit') {
			grid.showColumn('Username');
		} else if (filter === 'Open') {
			grid.hideColumn('Username');
		}
	},

    onFiltersClicked: function(el) {
		if (this.applyingState || this.stateDisabled) {
			return;
		}

		this.filterMenu.showBy(el, 'tl-tl', [0, -39]);
	},

    setSearch: function(str) {
		this.searchTerm = str;
		this.filterMenu.setSearch(str);
	},

    doSearch: function(str) {
		this.down('grid').getSelectionModel().deselectAll(true);
		this.searchTerm = str;
		this.updateFilter();
	},

    doFilter: function(filter) {
		this.updateColumns(filter);
		try {
			this.down('grid').getSelectionModel().deselectAll(true);
			this.currentFilter = filter;
			this.updateFilter();
		} catch (e) {
			console.log('Meh');
		}
	},

    updateFilter: function() {
		var state = this.current_state || {},
			newPage = state.currentPage !== this.currentPage,
			header = this.pageHeader;

		if (this.stateDisabled) { return; }

		if (this.currentFilter) {
			state.filter = this.currentFilter;
		} else {
			delete state.filter;
		}

		if (this.searchTerm) {
			state.searchTerm = this.searchTerm;
		} else {
			delete state.searchTerm;
		}

		if (this.currentPage) {
			if (!newPage) { this.currentPage = 1; }
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

		this.current_state = state;

		if (newPage) {
			this.pushRouteState(state);
		} else {
			this.replaceRouteState(state);
		}
	},

    loadPage: function(page) {
		this.currentPage = page;

		this.updateFilter();
	},

    setPageSize: function(size) {
		this.pageSize = size;

		this.updateFilter();
	},

    changeSort: function(ct, column, direction) {
		if (this.applyingState || this.stateDisabled) { return false; }

		var prop = column.sortOn || column.dataIndex;

		if (prop) {
			this.sort = {
				prop: prop,
				direction: direction
			};
		} else {
			this.sort = {};
		}

		if (!this.applyingState) {
			this.updateFilter();
		}

		return false;
	},

    fireGoUp: function() {
		this.pushRoute('', '/');
	},

    firePreviousEvent: function(e) {
		if (e.getTarget('.disabled')) {
			e.stopEvent();
			return;
		}

		var prev = this.pageSource.getPrevious(),
			title = this.pageSource.getNextTitle();

		prev = ParseUtils.encodeForURI(prev);

		this.pushRoute(title, prev + '/students');
	},

    fireNextEvent: function(e) {
		if (e.getTarget('.disabled')) {
			e.stopEvent();
			return;
		}

		var next = this.pageSource.getNext(),
			title = this.pageSource.getNextTitle();

		next = ParseUtils.encodeForURI(next);

		this.pushRoute(title, next + '/students');
	},

    onItemClick: function(v, record) {
		var selModel = v.getSelectionModel(),
			selection = selModel && selModel.selection,
			dataIndex = selection && selection.columnHeader.dataIndex;


		if (dataIndex !== 'Grade') {
			this.fireGoToAssignment(selModel, record);
		}
	},

    fireGoToAssignment: function(v, record, pageSource) {
		var student = record.get('User'),
			historyItem = record.get('HistoryItemSummary');

		if (typeof student === 'string' || !student.isModel) {
			console.error('Unable to show assignment for student', student.getName(), this.assignment.get('title'));
			return;
		}

		this.showStudentForAssignment(student, this.assignment, historyItem);
	},

    goToRawAssignment: function() {
		var title = this.assignment.get('title'),
			id = this.assignment.getId();

		id = ParseUtils.encodeForURI(id);

		this.pushRoute(title, id, {assignment: this.assignment});
	}
});
