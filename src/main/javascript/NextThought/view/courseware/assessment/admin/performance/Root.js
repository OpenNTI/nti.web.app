Ext.define('NextThought.view.courseware.assessment.admin.performance.Root', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance-root',

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
									{ tag: 'tpl', 'if': 'ungraded &gt; 0', cn: { html: '{ungraded:plural("Ungraded Assignment")}'}},
									{ tag: 'tpl', 'if': 'comments &gt; 0', cn: { html: '{comments:plural("Comment")}'}}
								]}
							]}
						]}
					]), listeners: {
							headerclick: function() {
								var store = this.up('grid').getStore(),
									sorter = {
										direction: this.sortState,
										sorterFn: Globals.getNaturalSorter('displayName')
									};
								store.sorters.clear();
								store.sorters.add('displayName', sorter);
								store.sort();
							}
					}},
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
				sortchange: function(ct, column) { ct.up('grid').markColumn(column); },
				selectionchange: function(sm, selected) { sm.deselect(selected); },
				viewready: function(grid) {
					grid.mon(grid.getView(), 'refresh', function() {
						grid.markColumn(grid.down('gridcolumn[sortState]'));
					});
				}
			},

			markColumn: function(c) {
				//console.log('Marking...');
				var cls = 'sortedOn',
						el = this.getEl();
				if (el) {
					el.select('.' + cls).removeCls(cls);
					if (c) {
						Ext.select(c.getCellSelector()).addCls(cls);
					}
				}
			}
		}
	],


	//<editor-fold desc="Init">
	constructor: function() {
		this.backingStore = new Ext.data.Store({
			fields: [
				{name: 'id', type: 'string'},
				{name: 'user', type: 'auto'},
				{name: 'avatar', type: 'string', defaultValue: 'resources/images/icons/unresolved-user.png'},
				{name: 'displayName', type: 'string', defaultValue: 'Resolving...'},
				{name: 'grade', type: 'int'},
				{name: 'letter', type: 'string', defaultValue: '-'},
				{name: 'comments', type: 'int', mapping: 'feedback', defaultValue: 0},
				{name: 'ungraded', type: 'int', defaultValue: 0},
				{name: 'overdue', type: 'int', defaultValue: 0}
			],
			sorters: [
			],
			getById: function(id) {
				return (this.snapshot || this.data).getByKey(id);
			}
		});
		this.store = new NextThought.store.MockPage({autoLoad: true, bind: this.backingStore});
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
			studentEl: { click: 'showStudentMenu', scope: this},
			itemEl: { click: 'showItemMenu', scope: this},
			inputEl: { keyup: 'changeNameFilter', scope: this},
			clearEl: { click: 'clearSearch', scope: this}
		});

		this.mon(this.grid, {
			cellclick: 'onCellClick'
		});
		//this.mon(this.frameBodyEl, { keydown: 'manageFocus' });
	},
	//</editor-fold>


	manageFocus: function(e, el) {
		if (!e.getTarget('.dropdown')) { return; }

		var me = this,
			node = Ext.get(el).parent('.item'),
			record = node && me.getRecord(node),
			chr = e.getCharCode();

		if (!record) {
			console.error('No record for node', node);
			return;
		}

		if (chr >= 65 && chr <= 70 && chr !== 69) {
			me.changeGrade(record, record.get('grade'), String.fromCharCode(chr))
				.done(function() {
					var node = me.getNode(record);

					if (!node) {
						console.error('No node for record', record);
					}

					Ext.fly(node).down('.dropdown').focus(10);
				});
		}

		if (chr === e.ENTER || chr === e.SPACE || chr === e.UP || chr === e.DOWN) {
			me.onDropDown(node, record);
		}
	},


	//<editor-fold desc="Header Managements">
	createStudentMenu: function() {
		var type = this.currentStudent || 'enrolled',
			items = [
				{ text: 'All Students', type: 'all', checked: type === 'all'},
				{ text: 'Open Students', type: 'open', checked: type === 'open'},
				{ text: 'Enrolled Students', type: 'enrolled', checked: type === 'enrolled'}
			];

		this.studentMenu = Ext.widget('menu', {
			ui: 'nt',
			cls: 'group-by-menu',
			plain: true,
			shadow: false,
			width: 257,
			frame: false,
			border: false,
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
			this.studentMenu.down('[type=enrolled]'),
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

		me.backingStore.removeFilter('studentFilter');

		this.updateExportEl(item.type);

		if (item.type === 'all') { return; }

		this.backingStore.filter([{
			id: 'studentFilter',
			filterFn: function(rec) {
				var user = rec.getId(),
					r = me.roster.map[user];

				function passes(enroll) {
					if (item.type === 'open') {
						return enroll === 'Open';
					}

					return enroll !== 'Open';
				}
				return r && passes(r.Status);
			}
		}], true);
	},


	updateExportEl: function(type) {
		var base = this.gradeBook.getLink('ExportContents');

		if (!base || !this.header.exportButton) {
			console.error('No link or no el to update');
			return;
		}

		if (type === 'all') {
			this.header.exportButton.update('Export All Students');
			this.header.exportButton.set({
				href: base
			});
		} else if (type === 'enrolled') {
			this.header.exportButton.update('Export Enrolled Students');
			this.header.exportButton.set({
				href: base + '?LegacyEnrollmentStatus=ForCredit'
			});
		} else if (type === 'open') {
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
				{ text: 'Ungraded Items', type: 'ungraded', checked: type === 'ungraded'},
				{ text: 'Commented Items', type: 'comment', checked: type === 'comment'}
			];

		this.itemMenu = Ext.widget('menu', {
			ui: 'nt',
			cls: 'group-by-menu',
			plain: true,
			shadow: false,
			width: 257,
			frame: false,
			border: false,
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

		this.backingStore.removeFilter('itemFilter');

		if (item.type === 'all') { return; }

		this.backingStore.filter([{
			id: 'itemFilter',
			filterFn: function(rec) {
			var overdue = rec.get('overdue'),
				ungraded = rec.get('ungraded'),
				comments = rec.get('comments');

				if (item.type === 'action') {
					return overdue || ungraded || comments;
				}

				if (item.type === 'overdue') {
					return overdue;
				}

				if (item.type === 'ungraded') {
					return ungraded;
				}

				if (item.type === 'comment') {
					return comments;
				}
		   }
	   }], true);
	},


	changeNameFilter: function() {
		var val = this.searchKey = this.header.inputEl.getValue();

		this.backingStore.removeFilter('searchFilter');

		if (this.searchKey) {
			val = val.toLowerCase();

			this.backingStore.filter([{
					id: 'searchFilter',
					filterFn: function(rec) {
						var name = rec.get('displayName');

						name = name.toLowerCase();

						return name.indexOf(val) >= 0;
					}
			}]);
		}
	},


	clearSearch: function() {
		this.searchKey = '';
		this.header.inputEl.dom.value = '';
		this.backingStore.removeFilter('searchFilter');
	},
	//</editor-fold>


	//<editor-fold desc="Data Bindings">
	setAssignmentStores: function(stores) {
		var me = this,
			feedbackMap = me._feedbackMap = {},
			feedbackListeners = [];


		function gatherFeedbacks(i) {
			var f = i.get('Feedback'),
				c = f && f.get('Creator');

			function updateRow() {
				var r = me.backingStore.getById(c);
				if (r) {
					me.updateActionables(r, c);
				} else {
					console.warn('Not updating row:', c);
				}
			}

			if (f) {
				(feedbackMap[c] = feedbackMap[c] || []).push(f);
				feedbackListeners.push(me.mon(f, {
					destroyable: true,
					'items-changed': updateRow
				}));
				updateRow();
			}
		}

		function itr(s) { s.each(gatherFeedbacks); }

		Ext.destroy(me._feedbackListeners);
		me._feedbackListeners = feedbackListeners;
		stores.forEach(itr);
	},


	setAssignmentsData: function(assignments, history, instance, gradeBook) {
		this.clearAssignmentsData();

		this.gradeBook = gradeBook;
		this.gradeBookDefaultPart = gradeBook && gradeBook.getFieldItem('Items', 'default');

		if (this.header.exportButton) {
			this.header.exportButton.set({
				href: gradeBook.getLink('ExportContents')
			});
		}

		this.assignments = assignments;
		this.mon(assignments, {
			'Roster-changed': 'applyRoster'
		});


		this.applyRoster();
	},


	applyRoster: function() {
		var users = [],
			store = this.backingStore, raw = [],
			applyUsers = this.applyUserData.bind(this),
			getCounts = this.getCountsFor.bind(this);

		this.roster = this.assignments.getRoster() || [];
		if (this.roster.length === 0) {
			return;
		}

		this.roster.forEach(function(r) {
			var u = r.Username;
			users.push(u);
			raw.push(Ext.apply({id: u}, getCounts(u)));
		});

		store.loadRawData(raw);
		UserRepository.makeBulkRequest(users).done(applyUsers);

		this.assignments.getViewMaster()
				.done(this.setAssignmentStores.bind(this))
				.fail(function() {
					alert('Failed to load grade & performance view.');
				});
	},


	clear: function() {
		this.backingStore.removeAll();
	},


	clearAssignmentsData: function() { this.clear(); },


	getCountsFor: function(username) {
		var d = this.gradeBookDefaultPart,
			assignments = (d && d.get('Items')) || [],
			feedbacks = (this._feedbackMap || {})[username] || [],
			counts = {
				comments: feedbacks.reduce(function(agg, o) {return agg + o.getCount();}, 0),
				ungraded: 0,
				overdue: 0
			};

		assignments.forEach(function(assignment) {
			var due = assignment.get('DueDate'),
				i = assignment.getFieldItem('Items', username);

			if (i && !i.get('value')) {counts.ungraded++;}
			//If we have a due date and its before now increment the overdue count
			//if we don't have a due date don't increment the overdue count
			if (!i && due && due < new Date()) {counts.overdue++;}
		});



		return counts;
	},


	updateActionables: function(rec, username) {
		rec.set(this.getCountsFor(username));
	},


	applyUserData: function(users) {
		var me = this,
			s = me.backingStore,
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
				r = s.getById(u.getId()), monitor;

			if (grade) {
				updateGrade(r, grade);
			} else if (gradebookentry) {
				monitor = me.mon(gradebookentry, {
					destroyable: true,
					'Items-changed': function(key, value) {
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
				displayName: u.toString()
			});
		});

		s.sort();

		s.resumeEvents();
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
			ui: 'nt',
			cls: 'letter-grade-menu',
			plain: true,
			shadow: false,
			width: 67,
			minWidth: 67,
			frame: false,
			border: false,
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
			url = this.gradeBook.get('href');//this may be broken on FireFox (_dc=1234)


		function maybeFocus() {
			var el = me.getNode(rec);

			if (fromEnter) {
				Ext.fly(el).down('input').focus(10);
			}
		}

		if (!grade) {
			console.log('No finaly grade entry');

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
