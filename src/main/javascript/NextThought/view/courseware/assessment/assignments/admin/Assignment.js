Ext.define('NextThought.view.courseware.assessment.assignments.admin.Assignment', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-assignments-item',

	requires: [
		'NextThought.proxy.courseware.PageSource',
		'NextThought.layout.component.CustomTemplate',
		'NextThought.store.courseware.AssignmentView',
		'NextThought.view.courseware.assessment.admin.PagedGrid',
		'NextThought.ux.FilterMenu',
		'NextThought.proxy.courseware.PagedPageSource',
		'NextThought.view.courseware.assessment.admin.Pager'
	],

	ui: 'course-assessment',
	cls: 'course-assessment-header assignment-item',

	layout: 'fit',
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
						{ tag: 'span', cls: 'path part current', html: '{pathBranch}'}
					]
				}
			]
		},
		//header
		{
			cls: 'header',
			cn: [
				{ cls: 'controls', cn: [
					//{ tag: 'a', href: '#', cls: 'reports', html: 'Reports'},
					{
						tag: 'a',
						href: '{exportFilesLink}',
						cls: 'download button hidden',
						html: '{{{NextThought.view.courseware.assessment.assignments.admin.Assignment.download}}}'
					},
					{ tag: 'a', href: '#request_change', cls: 'email button', html: '{{{NextThought.view.courseware.assessment.assignments.admin.Assignment.request}}}'}
				]},
				{ cls: 'title', html: '{assignmentTitle}' },
				{
					cls: 'subtitle',
					cn: [
						{ tag: 'span', cls: 'due', html: '{{{NextThought.view.courseware.assessment.assignments.admin.Assignment.due}}}'},
						{ tag: 'span', cls: 'toggle-avatar link enabled', html: 'Hide Avatars'},
						{ tag: 'span', cls: 'link filters arrow'}
					]
				},
				{ cls: 'pager-wrapper'}
			]
		},
		{ id: '{id}-body', cls: 'x-panel-body body', cn: ['{%this.renderContainer(out,values)%}'] }
	]),


	renderSelectors: {
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
		nextEl: { click: 'fireNextEvent' },
		changeDateEl: { click: 'requestDateChange' },
		filtersEl: { click: 'onFiltersClicked' }
	},


	items: [
		{
			anchor: '0 -115',
			xtype: 'course-admin-paged-grid',
			cls: 'student-assignment-overview',
			columnOrder: ['Student', 'Username', 'Completed', 'Grade', 'Feedback', 'Submission'],
			columnOverrides: {
				Student: {padding: '0 0 0 30'},
				Grade: {
					text: getString('NextThought.view.courseware.assessment.admin.Grid.score'),
					componentCls: 'score',
					tdCls: 'text score',
					tpl: new Ext.XTemplate(Ext.DomHelper.markup([
						{cls: 'gradebox', cn: [
							{tag: 'input', size: 3, tabindex: '1', type: 'text', value: '{[this.getGrade(values)]}'}
						]}
						]), {
							getGrade: function(values) {
								var historyItem = values.HistoryItemSummary,
									grade = historyItem && historyItem.get('Grade'),
									gradeVals = (grade && grade.getValues()) || {};

								return gradeVals.value || '';
							}
					})
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
		this.enableBubble(['show-assignment']);

		var me = this,
			grid = me.down('grid'),
			completed = grid && grid.down('[name=completed]');

		me.mon(me.pageSource, 'update', 'onPagerUpdate');

		me.filterMenu = this.down('filter-menupanel');

		me.mon(me.filterMenu, {
			filter: 'doFilter',
			search: {fn: 'doSearch', buffer: 450}
		});

		me.store = me.assignments.getAssignmentHistory(me.assignment);

		//mask when the store is loading
		me.mon(me.store, {
			beforeload: 'mask',
			load: 'onStoreLoad'
		});

		grid.bindStore(me.store);
		grid.dueDate = me.assignment.getDueDate();

		me.mon(grid, 'itemclick', 'onItemClick');

		//if there is a completed column but no parts on the assignment
		//hide the completed column
		if (me.assignment.isEmpty() && completed) {
			completed.hide();
		}

		$AppConfig.Preferences.getPreference('Gradebook')
			.then(function(value) {
				me.toggleAvatars(!value.get('hide_avatars'));
			});

		if (me.extraParams) {
			me.store.proxy.extraParams = Ext.apply(me.store.proxy.extraParams || {}, me.extraParams);
		}

		//load the store
		me.store.load();
	},


	beforeRender: function() {
		var grid = this.down('grid'),
			assignment = this.assignment;

		this.callParent(arguments);

		this.exportFilesLink = assignment.getLink('ExportFiles');
		this.pathBranch = this.assignmentTitle;

		this.renderData = Ext.apply(this.renderData || {}, {
			pathRoot: this.pathRoot,
			pathBranch: this.pathBranch,
			assignmentTitle: this.assignmentTitle,
			due: this.due,
			page: this.pageSource.getPageNumber(),
			exportFilesLink: this.exportFilesLink
		});

		this.maybeShowDownload();
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

		this.mon(this.avatarEl, 'click', 'toggleAvatarsClicked');

		pager = Ext.widget('course-assessment-admin-pager', {
			renderTo: this.pagerEl
		});

		this.on('destory', 'destory', pager);

		pager.bindStore(this.store);
	},


	syncFilterToUI: function(firstPass) {
		if (!this.rendered) {
			this.on({afterrender: 'syncFilterToUI', single: true});
			return;
		}

		var filter = this.currentFilter || 'ForCredit',
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
				s.on({ single: true, load: loaded });
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

		if (show) {
			this.avatarEl.update('Hide Avatars');
			this.avatarEl.removeCls('disabled');
			this.avatarEl.addCls('enabled');
			this.removeCls('hide-avatars');
		} else {
			this.avatarEl.update('Show Avatars');
			this.avatarEl.removeCls('enabled');
			this.avatarEl.addCls('disabled');
			this.addCls('hide-avatars');
		}

		$AppConfig.Preferences.getPreference('Gradebook')
			.then(function(value) {
				value.set('hide_avatars', !show);
				value.save();
			});
	},


	updateFilterCount: function() {
		if (!this.rendered) {
			this.on('afterrender', 'updateFilterCount', this);
			return;
		}

		this.filtersEl.update(this.filterMenu.getFilterLabel(this.store.getTotalCount()));
		this.filtersEl.repaint();
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
		if (!this.rendered) {
			return;
		}
		this._showMask();
	},


	unmask: function() {
		this._masked--;
		var gridMask = (this.down('gridview') || {}).loadMask;
		if (this._masked <= 0) {
			this._masked = 0;
			clearTimeout(this._maskIn);
			if (gridMask && !gridMask.isDestroyed) {
				gridMask.removeCls('masked-mask');
			}

			if (this.el && this.el.dom) {
				this.el.unmask();
			}
		}
	},


	onStoreLoad: function() {
		this.syncFilterToUI();
		this.unmask();
	},


	maybeShowDownload: function() {
		if (Ext.isEmpty(this.exportFilesLink)) {
			return;
		}

		Ext.destroy(this._maybeShowDownload);
		if (!this.rendered) {
			this._maybeShowDownload = this.mon(this, {
				destroyable: true, single: true,
				afterRender: 'maybeShowDownload'
			});
			return;
		}

		var s = this.store;
		if (s.getCount() === 0 || s.isLoading()) {
			this.mon(s, {load: 'maybeShowDownload', single: true});
			return;
		}

		//function hasSubmission(r) { return !!r.get('submission'); }
		//if (s.getRange().filter(hasSubmission).length > 0) {

		//the store is now buffered, and we cannot make this determination client side...
		// so always show it even if there are no submissions ('cause we can't know if there are or not)
		this.el.down('a.download').removeCls('hidden');
		//}
	},


	requestDateChange: function(e) {
		e.stopEvent();

		Globals.sendEmailTo(
				'support@nextthought.com',
				Ext.String.format('[CHANGE REQUEST] ({0}) {1}: {2}',
						location.hostname,
						$AppConfig.username,
						this.assignmentTitle)
		);

		return false;
	},


	updateColumns: function(filter) {
		var c = this.down('gridcolumn[name=username]');
		c[filter === 'ForCredit' ? 'show' : 'hide']();
	},


	onFiltersClicked: function() {
		this.filterMenu.showBy(this.filtersEl, 'tl-tl', [0, -39]);
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
		var s = this.store,
			params = s.proxy.extraParams;

		if (this.currentFilter) {
			params.filter = this.currentFilter;
		} else {
			delete params.filter;
		}

		if (this.searchTerm) {
			params.search = this.searchTerm;
		} else {
			delete params.search;
		}

		s.load();
	},


	fireGoUp: function() {
		this.fireEvent('goup', this);
	},


	firePreviousEvent: function(e) {
		if (e.getTarget('.disabled')) {
			e.stopEvent();
			return;
		}
		this.fireEvent('goto', this.pageSource.getPrevious());
	},


	fireNextEvent: function(e) {
		if (e.getTarget('.disabled')) {
			e.stopEvent();
			return;
		}
		this.fireEvent('goto', this.pageSource.getNext());
	},


	onItemClick: function(v, record) {
		var selModel = v.getSelectionModel(),
			selection = selModel && selModel.selection,
			dataIndex = selection && selection.columnHeader.dataIndex;


		if (dataIndex !== 'Grade') {
			this.fireGoToAssignment(selModel, record);
		}
	},


	restoreStudent: function(student) {
		if (this.store.loading) {
			this.mon(this.store, {
				single: true,
				delay: 1,
				load: this.restoreStudent.bind(this, student)
			});

			return;
		}

		var record;

		record = this.store.findBy(function(rec) {
			var user = rec.get('User');

			return student === NextThought.model.User.getIdFromRaw(user);
		});

		if (record >= 0) {
			record = this.store.getAt(record);

			this.fireGoToAssignment(null, record, null);
		}
	},


	fireGoToAssignment: function(v, record, pageSource) {
		var student = record.get('User'),
			historyItem = record.get('HistoryItemSummary'),
			item = historyItem && historyItem.get('item'), //Assignment Instance
			path = [
				this.pathRoot,
				this.pathBranch,
				student.toString()
			],
			container = this.up('[rootContainerShowAssignment]');

		if (typeof student === 'string') {
			return;
		}

		if (!pageSource) {
			pageSource = NextThought.proxy.courseware.PagedPageSource.create({
				store: this.store,
				startingRec: record
			});
		}

		if (!container) {
			console.error('No container with rootContainerShowAssignment');
			return;
		}

		return container.rootContainerShowAssignment(this, this.assignment, historyItem, student, path, pageSource);
		// this.fireEvent('show-assignment', this, this.assignment, record, student, path, pageSource);
	}
});
