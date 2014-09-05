Ext.define('NextThought.view.courseware.assessment.admin.performance.Root', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance-root',

	mixins: {
		gridGrades: 'NextThought.mixins.grid-feature.GradeInputs'
	},

	requires: [
		'NextThought.proxy.courseware.Roster'
	],

	__inputSelector: '.gradebox input',

	ui: 'course-assessment',
	cls: 'course-assessment-admin performance',

	layout: 'anchor',
	viewRoot: true,

	items: [
		{
			xtype: 'box',
			autoEl: { cls: 'header', cn: [
				{ cls: 'assignment-filterbar', cn: [
					{ cls: 'third dropmenu student', cn: [
						{ cls: 'label', html: getString('NextThought.view.courseware.assessment.admin.performance.Root.allstudents') }
					] },
					{ cls: 'third dropmenu item', cn: [
						{ cls: 'label', html: getString('NextThought.view.courseware.assessment.admin.performance.Root.allitems') }
					] },
					{ cls: 'third search', cn: [
						{ tag: 'input', type: 'text', placeholder: getString('NextThought.view.courseware.assessment.admin.performance.Root.search'), required: 'required' },
						{ cls: 'clear' }
					] }
				]},
				{
					cls: 'tools',
					cn: [
						{ tag: 'a', href: '{exportLink}', cls: 'download button', html: getString('NextThought.view.courseware.assessment.admin.performance.Root.export')}
					]
				}
			]},
			renderSelectors: {
				studentEl: '.student',
				itemEl: '.item',
				inputEl: '.search input',
				clearEl: '.search .clear',
				exportButton: 'a.download.button'
			}
		},{
			anchor: '0 -115',
			xtype: 'grid',

			scroll: 'vertical',

			verticalScroller: {
				synchronousRender: true
			},

			plugins: [{ptype: 'bufferedrenderer'}],
			columns: [
				{ text: 'Student', dataIndex: 'LastName', flex: 1, xtype: 'templatecolumn', tpl: new Ext.XTemplate(Ext.DomHelper.markup([
					{ cls: 'studentbox', cn: [
						{ cls: 'avatar', style: {backgroundImage: 'url({avatar})'}},
						{ cls: 'wrap', cn: [
							{ cls: 'name', html: '{[this.displayName(values)]}'},
							{ cls: 'action-items', cn: [
								{ tag: 'tpl', 'if': 'overdue &gt; 0', cn: {cls: 'overdue', html: '{overdue:plural("Assignment")} Overdue'}},
								{ tag: 'tpl', 'if': 'ungraded &gt; 0', cn: { html: '{ungraded:plural("Ungraded Assignment")}'}}
							]}
						]}
					]}
				]), {
					displayName: function(values) {
						var d = values.displayName,
							f = values.FirstName,
							l = values.LastName,
							lm;

						if (l) {
							lm = Ext.DomHelper.markup({tag: 'b', html: l});
							d = d.replace(l, lm);
							if (d === values.displayName) {
								d += (' (' + (f ? f + ' ' : '') + lm + ')');
							}
							d = Ext.DomHelper.markup({cls: 'accent-name', html: d});
						}

						return d;
					}
				})},



				{ text: 'Username', dataIndex: 'Username',
					renderer: function(v, cellStuff, r) {
						try {
							return r.get('Status') === 'ForCredit' ? (r.get('OU4x4') || v) : '';
						} catch (e) {
							console.error(e.stack || e.message || e);
							return '';
						}
					},
					doSort: function(state) {
						this.up('grid').getStore().sort(new Ext.util.Sorter({
							direction: state,
							property: 'username',
							transform: function(r) {
								return r && (r.get('Status') === 'ForCredit' ? (r.get('OU4x4') || v) : '');
							},
							defaultSorterFn: function(o1, o2) {
								var v1 = this.transform(o1);
								var v2 = this.transform(o2);
								return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
							}
						}));
					}
				},



				{ text: 'Grade', dataIndex: 'grade', width: 160, xtype: 'templatecolumn', tpl: Ext.DomHelper.markup([
					{ cls: 'gradebox', cn: [
						{ tag: 'input', size: 3, tabindex: '1', type: 'text', value: '{grade}'},
						{ cls: 'dropdown letter grade', tabindex: '1', html: '{letter}'}
					]}
				])}


			],

			listeners: {
				sortchange: function(ct, column) {
					ct.items.each(function(c) { c.tdCls = ''; }, ct);
					ct.up('grid').markColumn(column);
				},
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
						c.tdCls = 'sortedOn';
						Ext.select(c.getCellSelector()).addCls(cls);
					}
				}
			}
		}
	],


	//<editor-fold desc="Init">
	constructor: function() {
		this.store = new Ext.data.Store({
			proxy: 'nti.roster',

			fields: [
				{name: 'id', type: 'string', mapping: 'Username'},
				{name: 'user', type: 'auto'},
				{name: 'avatar', type: 'string', defaultValue: 'resources/images/icons/unresolved-user.png'},
				{name: 'displayName', type: 'string', defaultValue: getString('NextThought.view.courseware.assessment.admin.performance.Root.resolving')},
				{name: 'FirstName', type: 'string' },
				{name: 'LastName', type: 'string' },
				{name: 'Username', type: 'string', defaultValue: ''},
				{name: 'OU4x4', type: 'string', defaultValue: ''},
				{name: 'grade', type: 'string'},
				{name: 'letter', type: 'string', defaultValue: '-'},
				{name: 'action', type: 'int'},
				{name: 'ungraded', type: 'int', defaultValue: 0},
				{name: 'overdue', type: 'int', defaultValue: 0},
				{name: 'Status', type: 'string', mapping: 'LegacyEnrollmentStatus'}
			],

			filters: [
				{property: 'LegacyEnrollmentStatus', value: 'ForCredit'}
			],

			sorters: [
				{property: 'LastName', direction: 'ascending'}
			],

			remoteSort: false,
			remoteFilter: false,

			setSource: function(source) {
				this.currentPage = 1;
				this.getProxy().setSource(source);
				this.reload();
			}
		});

		Ext.apply(this.store.proxy, {
			sortParam: undefined,
			filterParam: undefined,
			idParam: undefined,
			startParam: undefined,
			limitParam: undefined
		});

		this.resortAndFilter = Ext.Function.createBuffered(this.resortAndFilter, 200, null, null);
		this.callParent(arguments);
	},


	initComponent: function() {
		this.callParent(arguments);
		this.supported = true;
		this.grid = this.down('grid');
		this.grid.bindStore(this.store);
		this.header = this.down('box');
		this.createGradeMenu();
	},


	afterRender: function() {
		this.callParent(arguments);

		var grid = this.grid;

		this.createStudentMenu();
		this.createItemMenu();

		if (!this.monitorSubTree()) {
			console.warn('Hidding Grade boxes because browser does not suppport MutationObserver. Chrome 18+, FF 14+, Safari 6+, IE11');
			this.supported = false;
			this.removeCls('show-final-grade');
		}

		//if we have a gradebook and haven't set the export link yet
		if (this.gradeBook && this.header.exportButton.el.getAttribute('href') === '{exportLink}') {
			this.header.exportButton.set({
				href: this.gradeBook.getLink('ExportContents')
			});
		}

		this.mon(this.header, {
			studentEl: {click: 'showStudentMenu', scope: this},
			itemEl: {click: 'showItemMenu', scope: this},
			inputEl: {keyup: 'changeNameFilter', scope: this, buffer: 350},
			clearEl: {click: 'clearSearch', scope: this}
		});

		this.mon(this.grid, {
			cellclick: 'onCellClick'
		});

		this.mon(this.store, 'refresh', function(store) {
			//if there are no records in the scrollTo will case an exception
			if (!store.getCount()) { return; }

			grid.verticalScroller.scrollTo(0);
		});
	},
	//</editor-fold>


	//<editor-fold desc="Header Managements">
	createStudentMenu: function() {
		var type = this.currentStudent || (isFeature('show-open-students-first') ? 'Open' : 'ForCredit'),
			items = [
				//{ text: 'All Students', type: 'all', checked: type === 'all'},
				{ text: getString('NextThought.view.courseware.assessment.admin.performance.Root.open'), type: 'Open', checked: type === 'Open'},
				{ text: getString('NextThought.view.courseware.assessment.admin.performance.Root.enrolled'), type: 'ForCredit', checked: type === 'ForCredit'}
			];

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
					'checkchange': 'switchStudent'
				}
			},
			items: items
		});
		this.studentMenu.show().hide();
		this.studentMenu.initialType = type;

		this.switchStudent(
			this.studentMenu.down('[checked]'),
			true,
			null,
			true
		);
	},


	showStudentMenu: function() {
		this.studentMenu.showBy(this.header.studentEl, 'tl-tl?', this.studentMenu.offset);
	},


	switchStudent: function(item, status, opts, noEmpty) {
		if (!status) { return; }

		var me = this, offset, x;
		try {
			offset = item.getOffsetsTo(this.studentMenu);
			x = offset && offset[1];
			me.header.studentEl.el.down('.label').update(item.text);
		} catch (e) {
			swallow(e);
		}

		me.studentMenu.offset = [0, -x];
		me.currentStudent = item.type;

		x = me.down('[dataIndex="Username"]');
		x[item.type === 'ForCredit' ? 'show' : 'hide']();

		this.updateExportEl(item.type);

		this.store.setSource(item.type);
		this.maybeSwitch(noEmpty);
		this.updateFilter();
	},


	maybeSwitch: function(noEmpty) {
		var menu = this.studentMenu,
			item = menu.down('[checked]'),
			initial = menu.initialType;

		if (item && item.type === initial) {
			this.store.on({
				single: true,
				load: function(s) {
					if (!s.getCount() && noEmpty) {
						item = menu.down('menuitem:not([checked])');
						if (item) {
							item.setChecked(true);
						}
					}
				}
			});
		}
	},


	updateExportEl: function(type) {
		var base = this.gradeBook && this.gradeBook.getLink('ExportContents');

		if (!base || !this.header.exportButton) {
			return;
		}

		/*if (type === 'all') {
			this.header.exportButton.update('Export All Students');
			this.header.exportButton.set({
				href: base
			});
		} else*/
		if (type === 'ForCredit') {
			this.header.exportButton.update(getString('NextThought.view.courseware.assessment.admin.performance.Root.exportenrolled'));
			this.header.exportButton.set({
				href: base + '?LegacyEnrollmentStatus=ForCredit'
			});
		} else if (type === 'Open') {
			this.header.exportButton.update(getString('NextThought.view.courseware.assessment.admin.performance.Root.exportopen'));
			this.header.exportButton.set({
				href: base + '?LegacyEnrollmentStatus=Open'
			});
		}
	},


	createItemMenu: function() {
		var type = this.currentItem,
			items = [
				{ text: getString('NextThought.view.courseware.assessment.admin.performance.Root.alloption'), type: 'all', checked: type === 'all'},
				{ text: getString('NextThought.view.courseware.assessment.admin.performance.Root.actionoption'), type: 'action', checked: type === 'action'},
				{ text: getString('NextThought.view.courseware.assessment.admin.performance.Root.overoption'), type: 'overdue', checked: type === 'overdue'},
				{ text: getString('NextThought.view.courseware.assessment.admin.performance.Root.unoption'), type: 'ungraded', checked: type === 'ungraded'}
			];

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
					'checkchange': 'switchItem'
				}
			},
			items: items
		});
	},


	showItemMenu: function() {
		this.itemMenu.showBy(this.header.itemEl, 'tl-tl?', this.itemMenu.offset);
	},


	switchItem: function(item, status) {
		if (!status) { return; }

		var offset = item.getOffsetsTo(this.itemMenu),
				x = offset && offset[1];

		this.header.itemEl.el.down('.label').update(item.text);

		this.itemMenu.offset = [0, -x];
		this.currentItem = item.type;

		this.updateFilter();
	},


	changeNameFilter: function() {
		this.searchKey = this.header.inputEl.getValue();
		this.updateFilter();
	},


	clearSearch: function() {
		this.searchKey = '';
		this.header.inputEl.dom.value = '';
		this.updateFilter();
	},


	updateFilter: function() {
		var filters = [],
			s = this.store;

		if (this.currentItem && !/all/i.test(this.currentItem)) {
			filters.push({
				property: this.currentItem,
				filterFn: function(r) {
					return Boolean(r && r.get(this.property));
				}
			});
		}

		if (!Ext.isEmpty(this.searchKey)) {
			filters.push({
				re: new RegExp(RegExp.escape(this.searchKey), 'i'),
				filterFn: function(r) {
					return this.re.test(r.get('displayName'));
				}
			});
		}

		if (!filters.length) {
			s.clearFilter();
		} else {
			s.filters.removeAll();
			s.filter(filters);
		}
	},
	//</editor-fold>


	//<editor-fold desc="Data Bindings">
	resortAndFilter: function() {
		var focused = this.getFocusedInput(),
			s = this.store;

		if (s.isFiltered()) {s.filter();}//refilter
		s.sort();

		this.setFocusedInput(focused);
	},


	setAssignmentsData: function(assignments) {
		this.clearAssignmentsData();

		var s = this.store,
			gradeBook = assignments.gradeBook;
		this.gradeBook = gradeBook;
		this.gradeBookDefaultPart = gradeBook && gradeBook.getFieldItem('Items', 'default');

		this.updateExportEl(this.currentStudent);

		if (this.header.exportButton) {
			this.header.exportButton.set({
				href: gradeBook.getLink('ExportContents')
			});
		}

		this.assignments = assignments;
		this.mon(s, {load: 'applyRoster', prefetch: 'applyRoster'});
		s.getProxy().setURL(assignments.getRosterURL());
		return Promise.resolve();
	},


	applyRoster: function(s, rec, success) {
		if (!success) {return;}

		var users = [],
			recsMap = {},
			applyUsers = this.applyUserData.bind(this, recsMap),
			getCounts = this.getCountsFor.bind(this);

		s.suspendEvents(true);

		rec.forEach(function(r) {
			var u = r.get('Username');
			users.push(u);
			recsMap[u] = r;
			r.set(getCounts(u));
			r.commit(true);
		});

		s.resumeEvents();
		this.resortAndFilter();

		UserRepository.makeBulkRequest(users).done(applyUsers);
	},


	clear: function() {
		//this.store.removeAll();
	},


	clearAssignmentsData: function() { this.clear(); },


	getCountsFor: function(username) {
		var counts = {
				ungraded: 0,
				overdue: 0
			};
		this.assignments.get('Items').forEach(function(assignment) {
			var due = assignment.getDueDate(),
				parts = (assignment.get('parts') || []).length,
				entry = assignment.getGradeBookEntry(),
				i = entry && entry.getFieldItem('Items', username),
				g = ((i && i.get('value')) || '').toString().split(' ')[0].trim();

			if (i && parts > 0 && Ext.isEmpty(g)) { counts.ungraded++; }
			//If we have a due date and its before now increment the overdue count
			//if we don't have a due date don't increment the overdue count
			if (!i && due && due < new Date()) {counts.overdue++;}
		});

		counts.action = counts.ungraded + counts.overdue;

		return counts;
	},


	updateActionables: function(rec, username) {
		rec.set(this.getCountsFor(username));
		//this.resortAndFilter();
	},


	applyUserData: function(recsMap, users) {
		var me = this,
			s = me.store,
			gradebookentry = me.gradeBook.getItem('Final Grade', 'no_submit');

		function getGrade(entry, user) {
			return entry && entry.getFieldItem('Items', user.getId());
		}

		function setGrade(r, value) {
			var v = value.getValues();
			r.set({
				grade: v.value,
				letter: v.letter
			});
			r.commit(true);
		}

		function updateGrade(r, grade) {
			setGrade(r, grade);
			me.mon(grade, 'value-changed', function() {
				setGrade(r, grade);
			});
		}


		if (gradebookentry && this.supported) {
			this.addCls('show-final-grade');
		}

		s.suspendEvents(true);

		users.forEach(function(u) {
			var grade = getGrade(gradebookentry, u),
				r = recsMap[u.getId()], monitor;

			if (grade) {
				updateGrade(r, grade);
			} else if (gradebookentry) {
				monitor = me.mon(gradebookentry, {
					destroyable: true,
					'Items-changed': function() {
						var grade = getGrade(gradebookentry, u);
						if (grade) {
							Ext.destroy(monitor);
							updateGrade(r, grade);
						}
					}
				});
			}

			me.mon(me.gradeBook, 'Items-changed', function() {
				me.updateActionables(r, u.getId());
			});

			r.set({
				user: u,
				avatar: u.get('avatarURL'),
				displayName: u.toString(),
				FirstName: u.get('FirstName'),
				LastName: u.get('LastName'),
				OU4x4: r.get('Status') === 'Open' ? '' : u.get('OU4x4'),
				Username: r.get('Status') === 'Open' ? '' : u.get('Username')
			});
			r.commit(true);
		});

		s.resumeEvents();
		this.resortAndFilter();
	},


	getNode: function(record) {
		var v = this.grid.getView();
		return v.getNode.apply(v, arguments);
	},


	getRecord: function(node) {
		var v = this.grid.getView();
		return v.getRecord.apply(v, arguments);
	},


	getFocusedInput: function() {
		var input = document.querySelector(':focus');

		function toSelector(tag) {
			var s = tag.tagName,
				cls = tag.className.replace(/\W+/g, '.');
			return Ext.isEmpty(cls) ? s : (s + '.' + cls);
		}

		return input && {record: this.getRecord(Ext.fly(input).up(this.__getGridView().itemSelector)), tag: toSelector(input)};
	},


	setFocusedInput: function(info) {
		var record = info && info.record,
			tag = info && info.tag,
			n = record && this.__getGridView().getNode(record);
		return n && wait(1).then(function() {
			n = n.querySelector(tag);
			if (n) {
				n.focus();
			}
		});
	},
	//</editor-fold>


	//<editor-fold desc="Event Handlers">
	__getGridView: function() {
		return this.grid.getView();
	},


	onCellClick: function(me, td, cellIndex, record, tr, rowIndex, e) {
		var isControl = !!e.getTarget('.gradebox');
		if (isControl && e.type === 'click') {
			try {
				if (e.getTarget('.dropdown')) {
					this.onDropDown(td, record);
				}
			}
			finally {
				e.stopPropagation();
			}
			return;
		}

		this.fireEvent('student-clicked', this, record);
	},


	createGradeMenu: function() {
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
					'checkchange': 'changeLetterGrade'
				}
			},
			//Don't know if these need to be translated
			items: [
				{text: '-'},
				{text: 'A'},
				{text: 'B'},
				{text: 'C'},
				{text: 'D'},
				{text: 'F'}
			]
		});
	},


	onDropDown: function(node, record) {
		var me = this,
			rec = record || me.grid.getRecord(node),
			el = Ext.get(node),
			dropdown = el && el.down('.gradebox .letter'),
			current;

		me.gradeMenu.items.each(function(item, index) {
			var x = item.height * index;

			if (item.text === rec.get('letter')) {
				item.setChecked(true, true);
				me.gradeMenu.offset = [-1, -x];
				current = item;
			} else {
				item.setChecked(false, true);
			}
		});

		if (dropdown) {
			me.activeGradeRecord = rec;
			me.gradeMenu.showBy(dropdown, 'tl-tl', me.gradeMenu.offset);
		}
	},


	changeLetterGrade: function(item, status) {
		if (!this.activeGradeRecord || !status) { return; }
		var g = this.activeGradeRecord.get('grade'),
			n = this.getNode(this.activeGradeRecord);

		n = n && n.querySelector('.gradebox input');

		if (n && n.value !== g) {
			g = n.value;
		}

		this.editGrade(this.activeGradeRecord, g, item.text);
	},


	editGrade: function(record, number, letter) {
		if (!this.gradeBook) { return; }

		var me = this,
			view = me.__getGridView(),
			gradebookentry = me.gradeBook.getItem('Final Grade', 'no_submit'),
			grade = gradebookentry && gradebookentry.getFieldItem('Items', record.getId()),
			oldValues = grade && grade.getValues(),
			url = me.gradeBook.get('href');

		//if we were not given a value for letter use the old letter value
		if (!letter) {
			letter = oldValues && oldValues.letter;
		}

		//if there isn't a grade and the values we are trying to save are empty don't bother
		if (!grade && NextThought.model.courseware.Grade.isEmpty(number, letter)) {
			return;
		}

		//if we are trying to save the same values that are already set don't bother
		if (grade && grade.valueEquals(number, letter)) {
			return;
		}

		Ext.fly(view.getNode(record)).setStyle({opacity: '0.3'});

		if (!grade) {
			url += '/no_submit/Final Grade/' + record.getId();
			grade = NextThought.model.courseware.Grade.create({
				href: url,
				Username: record.getId()
			});

			me.gradeBook.add(grade, null);
		}

		console.debug('saving: %s %s to %s', number, letter, grade.get('href'));

		return wait(300).then(function() {
			var input = me.getFocusedInput();

			grade.phantom = false;

			return grade.saveValue(number, letter)
				.always(function() {
					var n = view.getNode(record);

					if (n) {
						Ext.fly(n).setStyle({opacity: 1});
					}

					return me.setFocusedInput(input);
				});
			});
	}
	//</editor-fold>
});
