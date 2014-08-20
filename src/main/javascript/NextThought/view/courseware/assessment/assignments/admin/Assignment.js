Ext.define('NextThought.view.courseware.assessment.assignments.admin.Assignment', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-assignments-item',

	requires: [
		'NextThought.proxy.courseware.PageSource',
		'NextThought.layout.component.CustomTemplate',
		'NextThought.store.courseware.AssignmentView',
		'NextThought.view.courseware.assessment.admin.Grid',
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
						{ tag: 'span', cls: 'link arrow'}
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
		filtersEl: '.header span.link',
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
			xtype: 'course-admin-grid',
			cls: 'student-assignment-overview',
			nameOrder: ['creator', 'username', 'completed', 'grade', 'feedback', 'submission'],
			columnOverrides: {
				0: {
					text: getString('NextThought.view.courseware.assessment.assignments.admin.Assignment.student'),
					xtype: 'templatecolumn',
					dataIndex: 'Creator',
					name: 'creator',
					flex: 1,
					padding: '0 0 0 30',
					possibleSortStates: ['ASC', 'DESC'],//restore the default order of state(since the grid reverses it)
					tpl: new Ext.XTemplate(Ext.DomHelper.markup([{
								cls: 'padded-cell user-cell student-cell', cn: [
									{ cls: 'avatar', style: {backgroundImage: 'url({Creator:avatarURL})'} },
									{ cls: 'name', html: '{[this.displayName(values)]}'}
								]
						}]), {
							displayName: function(values) {
								if (Ext.isString(values.Creator)) {
									return 'Resolving';
								}

								var creator = values.Creator,
									displayName = creator && creator.get && creator.get('displayName'),
									f = creator && creator.get && creator.get('FirstName'),
									l = creator && creator.get && creator.get('LastName'),
									lm, d = displayName;

								if (l) {
									lm = Ext.DomHelper.markup({tag: 'b', html: l});
									d = displayName.replace(l, lm);
									if (d === displayName) {
										d += (' (' + (f ? f + ' ' : '') + lm + ')');
									}
									d = Ext.DomHelper.markup({cls: 'accent-name', html: d});
								}

								return d;
							}
						}
					),
					doSort: function(state) {
						this.up('grid').getStore().sort(new Ext.util.Sorter({
							direction: state,
							property: 'realname'
						}));
					} }
			},
			extraColumns: [
				{ text: getString('NextThought.view.courseware.assessment.assignments.admin.Assignment.username'), dataIndex: 'Creator', name: 'username',
					possibleSortStates: ['ASC', 'DESC'],//restore the default order of state(since the grid reverses it)
					renderer: function(v, g, record) {
						var username = (v.get && (v.get('OU4x4') || v.get('Username'))) || v,
								f = record.store && record.store.filters;

						f = f && f.getByKey('LegacyEnrollmentStatus');

						if (!f || f.value === 'Open') {
							return '';
						}

						return username;
					},
					doSort: function(state) {
						this.up('grid').getStore().sort(new Ext.util.Sorter({
							direction: state,
							property: 'username'
						}));
					}
				}
			]
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
		this.store = config.assignment.getSubmittedHistoryStore();
		this.items[0].store = this.store;
		this.callParent(arguments);
		this.mon(this.store, 'load', 'updateFilterCount');
	},


	initComponent: function() {
		this._masked = 0;
		this.callParent(arguments);
		this.enableBubble(['show-assignment']);
		this.mon(this.pageSource, 'update', 'onPagerUpdate');

		this.filterMenu = this.down('filter-menupanel');
		this.mon(this.filterMenu, {
			filter: 'doFilter',
			search: {fn: 'doSearch', buffer: 450}
		});

		var grid = this.down('grid'),
			completed = grid && grid.down('[dataIndex=completed]');

		if (completed && Ext.isEmpty(this.assignment.get('parts'))) {
			completed.hide();
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


	afterRender: function() {
		this.callParent(arguments);

		var gradeBookEntry = this.assignment.getGradeBookEntry(),
			reportLinks = gradeBookEntry && gradeBookEntry.getReportLinks(),
			reportsEl = this.reportsEl;

		this.el.query('a.button').forEach(this._setupButtons);

		if (this._masked) {
			this._showMask();
		}
		this.syncFilterToUI(true);
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
		var student = record.get('Creator'),
			item = record.get('item'), //Assignment Instance
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
				model: this.store.getProxy().getModel(),
				url: NextThought.proxy.courseware.PageSource.urlFrom(this.store),
				idExtractor: function(o) {
					var u = o && o.get('Creator');
					return u && ((u.getId && u.getId()) || u);
				},
				modelAugmentationHook: function(rec) {
					rec.set('item', item); //Assignment instances are shared across all history item instances. (this gives them the meta data)
					item.getGradeBookEntry().updateHistoryItem(rec);

					try {rec.buildGrade();} catch (e) {Error.raiseForReport(e);}
					return rec;
				}
			});
		}

		if (!container) {
			console.error('No container with rootContainerShowAssignment');
			return;
		}

		return container.rootContainerShowAssignment(this, this.assignment, record, student, path, pageSource);
		// this.fireEvent('show-assignment', this, this.assignment, record, student, path, pageSource);
	}
});
