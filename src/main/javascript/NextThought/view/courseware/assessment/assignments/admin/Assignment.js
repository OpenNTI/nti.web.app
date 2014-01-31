Ext.define('NextThought.view.courseware.assessment.assignments.admin.Assignment', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-assignments-item',

	requires: [
		'NextThought.store.courseware.AssignmentView',
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
			xtype: 'grid',
			ui: 'course-assessment',
			plain: true,
			border: false,
			frame: false,
			cls: 'student-assignment-overview',
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
								if (!e.record || e.field !== 'Grade') { return false; }

								var gradeRec = e.record.get('Grade'),
									value = gradeRec && gradeRec.get('value'),
									grades = value && value.split(' '),
									grade = grades && grades[0];

								if (!gradeRec) {
									e.record.buildGrade();
								}

								e.value = grade;
								editor.getEditor(e.record, e.column).offsets = [-4, 9];
							}
						},
						validateedit: {
							element: 'el',
							fn: function(editor, e) {
								var grade = e.record.get('Grade'),
									v = grade.get('value');

								v = v && v.split(' ')[0];

								if (v !== e.value && !Ext.isEmpty(e.value)) {
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
						   { text: 'Student', dataIndex: 'Creator', flex: 1, padding: '0 0 0 30', renderer: function(v) {
							   var u = v && (typeof v === 'string' ? {displayName: 'Resolving...'} : v.getData());
							   return this.studentTpl.apply(u);
						   } },
						   { text: 'Completed', dataIndex: 'submission', width: 150, renderer: function(v, col, rec) {
							   var d = this.dueDate,
								   s = (v && v.get && v.get('Last Modified')) || v,
								   item = rec.get('item'),
								   parts = item && item.get('parts'),
								   submission = rec.get('Submission');


							   if (!parts || !parts.length) {
								   return '';
							   }

							   if (!s || ((submission && submission.get('parts')) || []).length === 0) {
								   return Ext.DomHelper.markup({cls: 'incomplete', html: 'Incomplete'});
							   }
							   if (d > s) {
								   return Ext.DomHelper.markup({cls: 'ontime', html: 'On Time'});
							   }
							   if (!d) {
								   return Ext.DomHelper.markup({cls: 'ontime', html: 'Submitted ' + Ext.Date.format(s, 'm/d')});
							   }

							   d = new Duration(Math.abs(s - d) / 1000);

							   return Ext.DomHelper.createTemplate({cls: 'late', html: '{late} Late'}).apply({
								   late: d.ago().replace('ago', '').trim()
							   });
						   } },
						   { text: 'Score', componentCls: 'score', dataIndex: 'Grade', width: 90,
							   editor: 'textfield',
							   renderer: function(v) {
								   v = v && v.get('value');
								   return v && v.split(' ')[0];
							   },
							   listeners: {
								   headerclick: function() {
									   var store = this.up('grid').getStore(),
											   sorter = new Ext.util.Sorter({
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
									});

								store.sorters.clear();
								store.sorters.add('Grade', sorter);
								store.sort();
								if (store.bind) {
									store = store.bind;
									store.sorters.clear();
									store.sorters.add('Grade', sorter);
									store.sort();
								}
							}
						}},
						   { text: 'Feedback', dataIndex: 'feedback', width: 140, renderer: function(items) {
							   return items ? Ext.util.Format.plural(items, 'Comment') : '';
						   } },
						   { text: '', dataIndex: 'Submission', sortable: false, width: 40, renderer: function(v) {
							   return v && Ext.DomHelper.markup({cls: 'actions'});
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
			},



			studentTpl: Ext.DomHelper.createTemplate({cls: 'padded-cell student-cell', cn: [
				{ cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'} },
				{ cls: 'name', html: '{displayName}'}
			]})
		}],


	initComponent: function() {
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
					return !r || r.get('Status') !== 'Open';
			    }
			}
		};
		this.callParent(arguments);
		this.enableBubble(['show-assignment']);
		this.filledStorePromise = new Promise();

		this.on('destroy', 'cleanupFilters');
	},


	afterRender: function() {
		this.callParent(arguments);
		this.initFilters();
	},


	refilter: function() {
		this.store.filter();
	},


	initFilters: function() {
		this.mon(this.assignment, {
			buffer: 1,
			'roster-set': 'refilter'
		});
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

		grid = this.down('grid');
		grid.dueDate = a.getDueDate();

		if (!parts || !parts.length) {
			grid.down('[dataIndex=submission]').hide();
		}

		grid.bindStore(this.store);
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

		this.applyFilter(filter, !checked);
	},


	applyFilter: function(filterName, state) {
		if (!state) {
			this.store.removeFilter(filterName);
			return;
		}

		this.store.addFilter(this.getFilter(filterName));
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
		var nib = e.getTarget('.actions'),
			selModel = v.getSelectionModel(),
			selection = selModel && selModel.selection,
			dataIndex = selection && selection.columnHeader.dataIndex,
			item = record.get('item'),
			noSubmit = item && item.get && (item.get('category_name') === 'no_submit');

		if (nib) {
			this.getActionsMenu(record).showBy(nib, 'tr-br');
			return;
		}

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
	},


	getActionsMenu: function(record) {
		var menu = Ext.widget('menu', {
			ui: 'nt',
			plain: true,
			shadow: false,
			frame: false,
			border: false,
			ownerCmp: this,
			constrainTo: Ext.getBody(),
			defaults: {
				ui: 'nt-menuitem',
				plain: true
			}
		});

		menu.add(new Ext.Action({
			text: 'Reset Assignment',
			scope: this,
			handler: Ext.bind(record.beginReset, record),
			itemId: 'delete-assignment-history',
			ui: 'nt-menuitem', plain: true
		}));


		menu.on('hide', 'destroy');

		return menu;
	}
});
