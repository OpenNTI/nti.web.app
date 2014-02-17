Ext.define('NextThought.view.courseware.assessment.assignments.admin.Assignment', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-assignments-item',

	requires: [
		'NextThought.store.courseware.AssignmentView',
		'NextThought.view.courseware.assessment.admin.Grid',
		'NextThought.store.MockPage'
	],

	ui: 'course-assessment',
	cls: 'course-assessment-header assignment-item',

	layout: 'fit',
	componentLayout: 'body',
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
						{ tag: 'span', html: '{page}'}, ' of ', {tag: 'span', html: '{total}'}
					] },
					{ cls: 'up' },
					{ cls: 'down' }
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
					{ tag: 'a', href: '{exportFilesLink}', cls: 'download button hidden', html: 'Download Files'}
				]},
				{ cls: 'title', html: '{assignmentTitle}' },
				{
					cls: 'subtitle',
					cn: [
						{ tag: 'span', cls: 'due', html: 'Due {due:date("l F j, Y")}'},
						{ tag: 'span', cls: 'link', html: 'Request a Change'}
					]
				},
				{
					cls: 'filters',
					cn: [
						//{tag: 'span', cls: 'label', html: 'Show:'},
						{tag: 'span', cls: 'nti-checkbox checked', html: 'Enrolled Students', 'data-qtip': 'Show Enrolled Students',
							'data-filter-id': 'not:open-enrolled'},
						{tag: 'span', cls: 'nti-checkbox checked', html: 'Open Students', 'data-qtip': 'Show Open Students',
							'data-filter-id': 'open-enrolled'}
					]
				}
			]
		},
		{ id: '{id}-body', cls: 'body', cn: ['{%this.renderContainer(out,values)%}'] }
	]),


	renderSelectors: {
		rootPathEl: '.toolbar .path.part.root',
		previousEl: '.toolbar .controls .up',
		nextEl: '.toolbar .controls .down',
		changeDateEl: '.header span.link',
		filtersEl: '.header .filters',
		openEnrolledCheckboxEl: '.header .filters .nti-checkbox[data-filter-id="open-enrolled"]'
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
			gradeEditorOffsets: [-4, 9],
			nameOrder: ['creator', 'username', 'completed', 'grade', 'feedback', 'submission'],
			columnOverrides: {
				0: { text: 'Student', dataIndex: 'Creator', name: 'creator', flex: 1, padding: '0 0 0 30',
					renderer: function(v) {
					   var u = v && (typeof v === 'string' ? {displayName: 'Resolving...'} : v.getData());
					   return this.studentTpl.apply(u);
				   } }
			},
			extraColumns: [
				{ text: 'Username', dataIndex: 'Creator', name: 'username',
					renderer: function(v, g, record) {
						var r = this.ownerCt && this.ownerCt.assignment.roster.map,
							username = (v.get && v.get('Username')) || v;

						if (r[username].Status === 'Open') {
							return '';
						}

						return username;
					},
					doSort: function(state) {
						var r = this.up('[assignment]').assignment.roster.map,
							store = this.up('grid').getStore(),
							sorter = new Ext.util.Sorter({
								direction: state,
								property: 'Creator',
								root: 'data',
								transform: function(o) {
									//JSG: Don't do as I do, this is saving several function calls per sort comparison,
									// for a large dataset. (read: carefull optimization) The perfered and more
									// traditional method of getting record fields is still required and you will
									// get my rebuke if I find this copied.
									var u = ((o && o.data && o.data.Username) || o) || '';
									return (r[u] !== 'Open' && u) || '';
								}
							});

						store.sort(sorter);
					}
				}
			],


			studentTpl: Ext.DomHelper.createTemplate({cls: 'padded-cell student-cell', cn: [
				{ cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'} },
				{ cls: 'name', html: '{displayName}'}
			]})
		}],


	initComponent: function() {
		this._masked = 0;
		this._filters = {
			'open-enrolled': {
				id: 'open-enrolled',
				myView: this,
			    filterFn: function(item) {
					var r = (this._roster = this._roster || this.myView.assignment.roster.map),
						c = item.get('Creator');
					c = typeof c === 'string' ? c : c.getId();
					r = r && c && r[c];
					//if no roster, can't filter...
					return !r || r.Status !== 'Open';
			    }
			}
		};
		this.callParent(arguments);
		this.enableBubble(['show-assignment']);
		this.filledStorePromise = PromiseFactory.make();
		this.mon(this.assignment, { buffer: 1, 'roster-set': 'refilter' });
		this.on('destroy', 'cleanupFilters');
	},


	afterRender: function() {
		this.callParent(arguments);
		if (this._masked) {
			this._showMask();
		}
		this.initFilters();
		this.down('grid').bindStore(this.store);
	},


	_showMask: function() {
		var el = this.el;
		this._maskIn = setTimeout(function() {
			if (el && el.dom) {
				el.mask('Loading', 'loading', true);
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
		if (this._masked <= 0) {
			this._masked = 0;
			clearTimeout(this._maskIn);
			if (this.el && this.el.dom) {
				this.el.unmask();
			}
		}
	},


	refilter: function() {
		if (this.store) {
			this.store.filter();
		}
	},


	initFilters: function() {
		var el = this.openEnrolledCheckboxEl;
		this.onFiltersClicked({getTarget: function() {return el;}});
	},


	beforeRender: function() {
		var a = this.assignment, s, grid, p = this.filledStorePromise,
			parts = this.assignment.get('parts');

		this.callParent();
		this.exportFilesLink = this.assignment.getLink('ExportFiles');
		this.pathBranch = this.assignmentTitle;
		this.renderData = Ext.apply(this.renderData || {}, {
			pathRoot: this.pathRoot,
			pathBranch: this.pathBranch,
			assignmentTitle: this.assignmentTitle,
			due: this.due,
			page: this.page,
			total: this.total,
			exportFilesLink: this.exportFilesLink
		});

		s = a.getSubmittedHistoryStore();
		this.store = NextThought.store.MockPage.create({
			bind: s,
			model: 'NextThought.model.courseware.UserCourseAssignmentHistoryItem'
		});

		if (!s.loading && s.getCount() > 0) {
			p.fulfill(s);
		} else {
			s.on({
				single: true,
				load: p.fulfill.bind(p)
			});
		}

		this.mask();
		p.always(this.unmask.bind(this));

		grid = this.down('grid');
		grid.dueDate = a.getDueDate();

		if (!parts || !parts.length) {
			grid.down('[dataIndex=submission]').hide();
		}

		this.maybeShowDownload();
		this.mon(grid, 'itemclick', 'onItemClick');
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

		function hasSubmission(r) { return !!r.get('submission'); }
		if (s.getRange().filter(hasSubmission).length > 0) {
			this.el.down('a.download').removeCls('hidden');
		}
	},


	requestDateChange: function() {
		Globals.sendEmailTo(
				'support@nextthought.com',
				Ext.String.format('[CHANGE REQUEST] ({0}) {1}: {2}',
						location.hostname,
						$AppConfig.username,
						this.assignmentTitle)
		);
	},


	cleanupFilters: function() {
		var filters = Ext.Object.getKeys(this._filters),
			store = this.store,
			last = filters.length - 1;

		filters.forEach(function(id, i) {
			store.removeFilter(id, i === last);
		});
	},


	onFiltersClicked: function(e) {
		var checked, cls = 'checked',
			el = e.getTarget('.nti-checkbox', null, true),
			filter;
		if (!el || el.hasCls('disabled')) {
			return;
		}

		filter = el.getAttribute('data-filter-id');
		if (!filter) {
			el.addCls('disabled');
			return;
		}

		checked = el.toggleCls(cls).hasCls(cls);

		this.mask();
		Ext.defer(this.applyFilter, 1, this, [filter, !checked]);
	},


	applyFilter: function(filterName, state) {
		try {
			var s = this.store;
			if (!state) {
				s.removeFilter(filterName);
			} else {
				s.addFilter(this.getFilter(filterName));
			}
		} finally {
			this.unmask();
		}
	},


	getFilter: function(name) {
		var not = name && name.substr(0, 4) === 'not:' && name.substr(4);
		if (!this._filters[name]) {
			if (not) {
				not = this.getFilter(not);
				this._filters[name] = {
					id: name,
					filterFn: function(item) {
						return !not.filterFn.call(not.scope || not, item);
					}
				};
			} else {
				//maybe later we can build it... :P
				Ext.Error.raise('No filter by the name ' + name + 'Found');
			}
		}

		return this._filters[name];
	},


	fireGoUp: function() {
		this.fireEvent('goup', this);
	},


	firePreviousEvent: function() {
		//page is 1 based, and we want to go to the previous index
		var index = this.page - 2;

		if (index < 0) {
			index = this.total - 1;
		}

		this.fireEvent('goto', index);
	},


	fireNextEvent: function() {
		//page is 1 based, and we want to go to the next index (so, next 0-based index = current page in 1-based)
		var index = this.page;

		if (index > (this.total - 1)) {
			index = 0;
		}

		this.fireEvent('goto', index);
	},


	onItemClick: function(v, record, dom, ix, e) {
		var selModel = v.getSelectionModel(),
			selection = selModel && selModel.selection,
			dataIndex = selection && selection.columnHeader.dataIndex,
			item = record.get('item'),
			noSubmit = item && item.get && (item.get('category_name') === 'no_submit');

		//if we didn't click on the grade cell or we don't have a grade yet
		if (noSubmit) {
			return;
		}

		if (dataIndex !== 'Grade' || !record.get('Grade')) {
			this.goToAssignment(selModel, record);
		}
	},


	goToAssignment: function(v, record) {
		var student = record.get('Creator'),
			path = [
				this.pathRoot,
				this.pathBranch,
				student.toString()
		];

		if (typeof student === 'string') {
			return;
		}

		this.fireEvent('show-assignment', this, this.assignment, record, student, path, this.store, this.store.indexOf(record) + 1);
	}
});
