Ext.define('NextThought.view.courseware.assessment.assignments.admin.Assignment', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-assignments-item',

	requires: [
		'NextThought.proxy.courseware.PageSource',
		'NextThought.layout.component.CustomTemplate',
		'NextThought.store.courseware.AssignmentView',
		'NextThought.view.courseware.assessment.admin.PagedGrid',
		'NextThought.ux.FilterMenu'
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
				}
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
		reportsEl: '.header .controls .reports'
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
			xtype: 'course-admin-paged-grid',
			cls: 'student-assignment-overview',
			columnOrder: ['Student', 'Username', 'Completed', 'Grade', 'Feedback', 'Submission'],
			columnOverrides: {
				Student: {padding: '0 0 0 30'}
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
		this.mon(this.pageSource, 'update', 'onPagerUpdate');

		this.store = this.assignments.getAssignmentHistory(this.assignment);


		this.filterMenu = this.down('filter-menupanel');
		this.mon(this.filterMenu, {
			filter: 'doFilter',
			search: {fn: 'doSearch', buffer: 450}
		});

		var me = this,
			grid = me.down('grid'),
			completed = grid && grid.down('[dataIndex=completed]');

		if (grid) {
			grid.bindStore(this.store);
		}

		this.store.load();

		if (completed && Ext.isEmpty(me.assignment.get('parts'))) {
			completed.hide();
		}

		$AppConfig.Preferences.getPreference('Gradebook')
			.then(function(value) {
				me.toggleAvatars(!value.get('hide_avatars'));
			});
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


	afterRender: function() {
		this.callParent(arguments);

		this.el.query('a.button').forEach(this._setupButtons);

		if (this._masked) {
			this._showMask();
		}
		this.syncFilterToUI(true);

		this.mon(this.avatarEl, 'click', 'toggleAvatarsClicked');
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


	syncFilterToUI: function(firstPass) {
		if (!this.rendered) {
			this.on({afterrender: 'syncFilterToUI', single: true});
			return;
		}

		var f = this.store.filters,
			filter = f.getByKey('LegacyEnrollmentStatus'),
			search = f.getByKey('search');

		if (filter) {
			filter = filter.value;
			this.updateColumns(filter);
		}

		this.filterMenu.setState(filter, (search && search.value) || '');
		this.updateFilterCount();

		if (firstPass) {
			this.filterMenu.initialState = filter;
			this.maybeSwitch();
		}
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


	beforeRender: function() {
		var a = this.assignment, s = this.store, grid, p,
			parts = this.assignment.get('parts');

		this.callParent();
		this.exportFilesLink = this.assignment.getLink('ExportFiles');
		this.pathBranch = this.assignmentTitle;
		this.renderData = Ext.apply(this.renderData || {}, {
			pathRoot: this.pathRoot,
			pathBranch: this.pathBranch,
			assignmentTitle: this.assignmentTitle,
			due: this.due,
			page: this.pageSource.getPageNumber(),
			total: this.pageSource.getTotal(),
			noNext: !this.pageSource.hasNext(),
			noPrev: !this.pageSource.hasPrevious(),
			exportFilesLink: this.exportFilesLink
		});

		p = new Promise(function(fulfill, reject) {
			if (!s.loading) {
				fulfill(s);
			} else {
				s.on({ single: true, load: fulfill });
			}
		});

		this.mask();
		p.always(this.unmask.bind(this));

		grid = this.down('grid');
		grid.dueDate = a.getDueDate();

		if (!parts || !parts.length) {
			grid.down('[dataIndex=submission]').hide();
		}

		this.maybeShowDownload();
		this.mon(grid, 'itemclick', 'onItemClick');

		this.mon(s, {
			beforeload: 'mask',
			load: 'unmask'
		});
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
		var c = this.down('gridcolumn[name="username"]');
		c[filter === 'ForCredit' ? 'show' : 'hide']();
	},


	onFiltersClicked: function() {
		this.filterMenu.showBy(this.filtersEl, 'tl-tl', [0, -39]);
	},


	doSearch: function(str) {
		this.down('grid').getSelectionModel().deselectAll(true);
		this.store.filter([{id: 'search', property: 'usernameSearchTerm', value: str}]);
	},


	doFilter: function(filter) {
		this.updateColumns(filter);
		try {
			this.down('grid').getSelectionModel().deselectAll(true);
			this.store.filter([
				{id: 'LegacyEnrollmentStatus', property: 'LegacyEnrollmentStatus', value: filter}
			]);
		} catch (e) {
			console.log('Meh');
		}
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
			pageSource = NextThought.proxy.courseware.PageSource.create({
				batchAroundParam: 'batchAroundCreator',
				current: record,
				backingStore: this.store,
				model: this.store.getProxy().getModel(),
				url: NextThought.proxy.courseware.PageSource.urlFrom(this.store),
				idExtractor: function(o) {
					var u = o && o.get('Creator');
					return u && ((u.getId && u.getId()) || u);
				},
				modelAugmentationHook: function(rec) {
					rec.set('item', item); //Assignment instances are shared across all history item instances. (this gives them the meta data)

					item.getGradeBookEntry()
						.then(function(grade) {
							grade.updateHistoryItem(rec);
						});

					item.getGradeBookEntry().updateHistoryItem(rec);

					return rec;
				}
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
