Ext.define('NextThought.view.courseware.assessment.admin.performance.Root', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance-root',

	requires: [
		'NextThought.proxy.courseware.Roster'
	],

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
						{ cls: 'label', html: 'All Students' }
					] },
					{ cls: 'third dropmenu item', cn: [
						{ cls: 'label', html: 'All Items' }
					] },
					{ cls: 'third search', cn: [
						{ tag: 'input', type: 'text', placeholder: 'Search Students', required: 'required' },
						{ cls: 'clear' }
					] }
				]},
				{
					cls: 'tools',
					cn: [
						{ tag: 'a', href: '{exportLink}', cls: 'download button', html: 'Export'}
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
			ui: 'course-assessment',
			plain: true,
			border: false,
			frame: false,
			scroll: 'vertical',
			sealedColumns: true,
			enableColumnHide: false,
			enableColumnMove: false,
			enableColumnResize: false,
			columnLines: false, rowLines: false,
			plugins: [{ptype: 'bufferedrenderer'}],
			columns: {
				ui: 'course-assessment',
				plain: true,
				border: false,
				frame: false,
				items: [
					{ text: 'Student', dataIndex: 'displayName', flex: 1, xtype: 'templatecolumn', tpl: Ext.DomHelper.markup([
						{ cls: 'studentbox', cn: [
							{ cls: 'avatar', style: {backgroundImage: 'url({avatar})'}},
							{ cls: 'wrap', cn: [
								{ cls: 'name', html: '{displayName}'},
								{ cls: 'action-items', cn: [
									{ tag: 'tpl', 'if': 'overdue &gt; 0', cn: {cls: 'overdue', html: '{overdue:plural("Assignment")} Overdue'}},
									{ tag: 'tpl', 'if': 'ungraded &gt; 0', cn: { html: '{ungraded:plural("Ungraded Assignment")}'}}
								]}
							]}
						]}
					])},



					{ text: 'Username', dataIndex: 'Username', renderer: function(v, cellStuff, r) {
						try {
							return r.get('Status') === 'ForCredit' ? v : '';
						} catch (e) {
							console.error(e.stack || e.message || e);
							return '';
						}
					} },



					{ text: 'Grade', dataIndex: 'grade', width: 160, xtype: 'templatecolumn', tpl: Ext.DomHelper.markup([
						{ cls: 'gradebox', cn: [
							{ tag: 'input', size: 3, tabindex: '1', type: 'text', value: '{grade}'},
							{ cls: 'dropdown letter grade', tabindex: '1', html: '{letter}'}
						]}
					])}


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
				{name: 'displayName', type: 'string', defaultValue: 'Resolving...'},
				{name: 'Username', type: 'string', defaultValue: ''},
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
				{property: 'displayName', direction: 'ascending'}
			],


			setSource: function(source) {
				this.currentPage = 1;
				this.getProxy().setSource(source);
				this.reload();
			}
		});
		this.onUpdate = Ext.Function.createBuffered(this.onUpdate, 200, null, null);
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
		var observer,
			MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

		this.callParent(arguments);

		this.createStudentMenu();
		this.createItemMenu();

		if (MutationObserver) {
			observer = new MutationObserver(this.bindInputs.bind(this));
			observer.observe(
					Ext.getDom(this.grid.getEl()),
					{ childList: true, subtree: true });
			this.on('destroy', 'disconnect', observer);
		} else {
			console.warn('Hidding Grade boxes because browser does not suppport MutationObserver. Chrome 18+, FF 14+, Safari 6+, IE11');
			this.supported = false;
			this.removeCls('show-final-grade');
		}

		if (this.gradeBook) {
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
	},
	//</editor-fold>


	//<editor-fold desc="Header Managements">
	createStudentMenu: function() {
		var type = this.currentStudent || 'ForCredit',
			items = [
				//{ text: 'All Students', type: 'all', checked: type === 'all'},
				{ text: 'Open Students', type: 'Open', checked: type === 'Open'},
				{ text: 'Enrolled Students', type: 'ForCredit', checked: type === 'ForCredit'}
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

		this.switchStudent(
			this.studentMenu.down('[type=ForCredit]'),
			true);
	},


	showStudentMenu: function() {
		this.studentMenu.showBy(this.header.studentEl, 'tl-tl?', this.studentMenu.offset);
	},


	switchStudent: function(item, status) {
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
		this.updateFilter();
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
			this.header.exportButton.update('Export Enrolled Students');
			this.header.exportButton.set({
				href: base + '?LegacyEnrollmentStatus=ForCredit'
			});
		} else if (type === 'Open') {
			this.header.exportButton.update('Export Open Students');
			this.header.exportButton.set({
				href: base + '?LegacyEnrollmentStatus=Open'
			});
		}
	},


	createItemMenu: function() {
		var type = this.currentItem,
			items = [
				{ text: 'All Items', type: 'all', checked: type === 'all'},
				{ text: 'Actionable Items', type: 'action', checked: type === 'action'},
				{ text: 'Overdue Items', type: 'overdue', checked: type === 'overdue'},
				{ text: 'Ungraded Items', type: 'ungraded', checked: type === 'ungraded'}
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
	onUpdate: function() {
		var s = this.store;
		if (s.isFiltered()) {s.filter();}//refilter
		s.sort();
	},


	setAssignmentsData: function(assignments) {
		this.clearAssignmentsData();

		var s = this.store,
			gradeBook = this.gradeBook = assignments.gradeBook;
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
		this.onUpdate();

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
				i = assignment.getGradeBookEntry().getFieldItem('Items', username);

			if (i && !i.get('value')) {counts.ungraded++;}
			//If we have a due date and its before now increment the overdue count
			//if we don't have a due date don't increment the overdue count
			if (!i && due && due < new Date()) {counts.overdue++;}
		});

		counts.action = counts.ungraded + counts.overdue;

		return counts;
	},


	updateActionables: function(rec, username) {
		rec.set(this.getCountsFor(username));
		this.onUpdate();
	},


	applyUserData: function(recsMap, users) {
		var me = this,
			s = me.store,
			gradebookentry = me.gradeBook.getItem('Final Grade', 'no_submit');

		function getGrade(entry, user) {
			return entry && entry.getFieldItem('Items', user.getId());
		}

		function parseGradeValue(grade) {
			var value = grade && grade.get('value'),
				grades = value && value.split(' '),
				number = grades && grades[0],
				letter = (grades && grades[1]) || '-';

			return {
				number: number,
				letter: letter
			};
		}

		function setGrade(r, value) {
			var v = parseGradeValue(value);
			r.set({
				grade: v.number,
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

		users.forEach(function(u, i) {
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
				Username: r.get('Status') === 'Open' ? '' : u.get('Username')
			});
			r.commit(true);
		});

		s.resumeEvents();
		this.onUpdate();
	},


	getNode: function(record) {
		var v = this.grid.getView();
		return v.getNode.apply(v, arguments);
	},


	getRecord: function(node) {
		var v = this.grid.getView();
		return v.getRecord.apply(v, arguments);
	},
	//</editor-fold>


	//<editor-fold desc="Event Handlers">
	bindInputs: function() {
		var inputs = this.grid.view.getEl().select('.gradebox input');
		Ext.destroy(this.gridInputListeners);

		this.gridInputListeners = this.mon(inputs, {
			destroyable: true,
			blur: 'onInputBlur',
			keypress: 'onInputChanged'
		});
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
		console.log('show menu for record:', rec);

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
		this.changeGrade(this.activeGradeRecord, this.activeGradeRecord.get('grade'), item.text);
	},


	changeGrade: function(rec, number, letter, fromEnter) {
		if (!this.gradeBook) { return; }

		var p = PromiseFactory.make(), me = this,
			gradebookentry = me.gradeBook.getItem('Final Grade', 'no_submit'),
			grade = gradebookentry && gradebookentry.getFieldItem('Items', rec.getId()),
			value = number + ' ' + letter,
			url = this.gradeBook.get('href').split(/[\?#]/)[0];


		function maybeFocus() {
			var el = me.getNode(rec);

			if (fromEnter) {
				Ext.fly(el).down('input').focus(10);
			}
		}

		if (!grade) {
			console.log('No final grade entry');

			rec.set({
				grade: number,
				letter: letter
			});

			url += '/no_submit/Final Grade/' + rec.getId();

			Ext.Ajax.request({
				url: url,
				method: 'PUT',
				jsonData: { value: value },
				success: function(r) {
					var json = Ext.decode(r.responseText, true),
						rec = json && ParseUtils.parseItems(json)[0];

					if (rec) {
						gradebookentry.addItem(rec);
						maybeFocus();
						p.fulfill();
					}
				},
				failure: function() {
					rec.reject();
					//probably should do something here
					console.error('Failed to save final grade:', arguments);
				}
			});
			return p;
		}

		grade.set('value', value);
		grade.save({
			callback: function(q, s) {
				if (s) {
					maybeFocus();
				} else {
					grade.reject();
				}
			}
		});

		p.fulfill();
		return p;
	},


	onInputChanged: function(e, input) {
		if (e.getCharCode() === e.ENTER) {
			this.saveGradeFromInput(e, input, true);
		}
	},


	onInputBlur: function(e, input) {
		this.saveGradeFromInput(e, input, false);
	},


	saveGradeFromInput: function(e, input, fromEnter) {
		var node = e.getTarget(this.grid.view.itemSelector),
			rec = node && this.getRecord(node);

		console.log('update record', rec, ' with input value:', input.value);
		this.changeGrade(rec, input.value, rec.get('letter'), fromEnter);
	}
	//</editor-fold>
});
