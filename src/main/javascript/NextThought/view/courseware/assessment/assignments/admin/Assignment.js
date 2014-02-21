Ext.define('NextThought.view.courseware.assessment.assignments.admin.Assignment', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-assignments-item',

	requires: [
		'NextThought.store.courseware.AssignmentView',
		'NextThought.view.courseware.assessment.admin.Grid'
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
						{tag: 'span', cls: 'nti-radiobutton checked', html: 'Enrolled Students', 'data-qtip': 'Show Enrolled Students',
							'data-filter-id': 'ForCredit'},
						{tag: 'span', cls: 'nti-radiobutton', html: 'Open Students', 'data-qtip': 'Show Open Students',
							'data-filter-id': 'Open'}
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
		openEnrolledCheckboxEl: '.header .filters .nti-radiobutton[data-filter-id="open-enrolled"]'
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
					},
					doSort: function(state) {
						this.up('grid').getStore().sort(new Ext.util.Sorter({
							direction: state,
							property: 'realname'
						}));
					} }
			},
			extraColumns: [
				{ text: 'Username', dataIndex: 'Creator', name: 'username',
					renderer: function(v, g, record) {
						var username = (v.get && v.get('Username')) || v,
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
			],


			studentTpl: Ext.DomHelper.createTemplate({cls: 'padded-cell student-cell', cn: [
				{ cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'} },
				{ cls: 'name', html: '{displayName}'}
			]})
		}],


	initComponent: function() {
		this._masked = 0;
		this.callParent(arguments);
		this.enableBubble(['show-assignment']);
		this.filledStorePromise = PromiseFactory.make();
	},


	afterRender: function() {
		this.callParent(arguments);
		if (this._masked) {
			this._showMask();
		}
		this.down('grid').bindStore(this.store);
		var filter = this.store.filters.getByKey('LegacyEnrollmentStatus');
		if (filter) {
			filter = filter.value;
			this.el.select('[data-filter-id]').removeCls('checked');
			this.el.select('[data-filter-id="' + filter + '"]').addCls('checked');
		}
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

		s = this.store = a.getSubmittedHistoryStore();

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


	onFiltersClicked: function(e) {
		var checked, cls = 'checked',
			el = e.getTarget('.nti-radiobutton', null, true),
			filter;
		if (!el || el.hasCls('disabled')) {
			return;
		}

		filter = el.getAttribute('data-filter-id');
		if (!filter) {
			el.addCls('disabled');
			return;
		}

		checked = el.hasCls(cls);

		if (!checked) {
			el.parent().select('.nti-radiobutton').removeCls(cls);
			el.addCls(cls);

			this.mask();
			Ext.defer(this.applyFilter, 1, this, [filter]);
		}
	},


	applyFilter: function(filter) {
		try {
			var c = this.down('gridcolumn[name="username"]');
			c[filter === 'ForCredit' ? 'show' : 'hide']();

			this.store.filter([{id: 'LegacyEnrollmentStatus', property: 'LegacyEnrollmentStatus', value: filter}]);
		} finally {
			this.unmask();
		}
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
