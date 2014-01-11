Ext.define('NextThought.view.courseware.assessment.admin.performance.Root', {
	extend: 'Ext.view.View',
	alias: 'widget.course-assessment-admin-performance-root',

	ui: 'course-assessment',
	cls: 'course-assessment-admin performance',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header assignment-filterbar', cn: [
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
			cls: 'scrollzone scrollable',
			cn: [
				{ tag: 'a', href: '{exportLink}', cls: 'download button', html: 'Export'},
				{
					cls: 'column-names',
					cn: [
						{cls: 'right grade', html: 'Course Grade'},
						{cls: 'descending student', html: 'Student'}
					]
				},
				{ cls: 'list'}
			]
		}
	]),

	renderSelectors: {
		titleEl: '.header',
		frameBodyEl: '.list',
		studentEl: '.header .student',
		itemEl: '.header .item',
		inputEl: '.header .search input',
		clearEl: '.header .search .clear',
		exportButton: 'a.download.button',
		studentEl: '.scrollzone .column-names .student',
		gradeEl: '.scrollzone .column-names .grade'
	},

	getTargetEl: function() { return this.frameBodyEl; },
	itemSelector: '.item',
	tpl: new Ext.XTemplate(
			Ext.DomHelper.markup(
					{ tag: 'tpl', 'for': '.', cn: [
						{ cls: 'item', cn: [
							{ cls: 'gradebox', cn: [
								{ tag: 'input', size: 3, tabindex: '1', type: 'text', value: '{grade}'},
								{ cls: 'dropdown letter grade', tabindex: '1', html: '{letter}'}
							]},
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
						]}
					]}
			), {
			}),

	clear: function() {
		this.store.removeAll();
	},


	afterRender: function() {
		this.callParent(arguments);

		this.createStudentMenu();
		this.createItemMenu();
		
		this.studentSort();

		if (this.gradeBook) {
			this.exportButton.set({
				href: this.gradeBook.getLink('ExportContents')
			});
		}

		this.on({
			studentEl: { click: 'showStudentMenu'},
			itemEl: { click: 'showItemMenu'},
			inputEl: { keyup: 'changeNameFilter'},
			clearEl: { click: 'clearSearch'},
			studentEl: { click: 'studentSort'},
			gradeEl: { click: 'gradeSort'}
		});

		this.mon(this.frameBodyEl, {
			keydown: 'manageFocus'
		});
	},


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


	createStudentMenu: function() {
		var type = this.currentShow,
			items = [
				{ text: 'All Students', type: 'all', checked: type === 'all'},
				{ text: 'Open Students', type: 'open', checked: type === 'open'},
				{ text: 'In Class Students', type: 'enrolled', checked: type === 'enrolled'}
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
	},


	showStudentMenu: function() {
		this.studentMenu.showBy(this.studentEl, 'tl-tl?', this.studentMenu.offset);
	},


	switchStudent: function(item, status) {
		if (!status) { return; }

		var me = this,
			offset = item.getOffsetsTo(this.studentMenu),
			x = offset && offset[1];

		me.studentEl.el.down('.label').update(item.text);

		me.studentMenu.offset = [0, -x];
		me.currentStudent = item.type;

		me.store.removeFilter('studentFilter');

		if (item.type === 'all') { return; }

		this.store.filter([{
			id: 'studentFilter',
			filterFn: function(rec) {
				var user = rec.get('user'), i;

				function passes(enroll) {
					if (item.type === 'open') {
						return enroll === 'Open';
					}

					if (item.type === 'enrolled') {
						return enroll !== 'Open';
					}
				}

				for (i = 0; i < me.roster.length; i++) {
					if (me.roster[i].Username === user.get('Username')) {
						return !passes(me.roster[i].LegacyFilterStatus);
					}
				}
			}
		}], true);
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
		this.itemMenu.showBy(this.itemEl, 'tl-tl?', this.itemMenu.offset);
	},


	switchItem: function(item, status) {
		if (!status) { return; }

		var offset = item.getOffsetsTo(this.itemMenu),
				x = offset && offset[1];

		this.itemEl.el.down('.label').update(item.text);

		this.itemMenu.offset = [0, -x];
		this.currentItem = item.type;

		this.store.removeFilter('itemFilter');

		if (item.type === 'all') { return; }

		this.store.filter([{
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
		var val = this.searchKey = this.inputEl.getValue();

		this.store.removeFilter('searchFilter');

		if (this.searchKey) {
			val = val.toLowerCase();

			this.store.filter([{
					id: 'searchFilter',
					filterFn: function(rec) {
						var name = rec.get('displayName');

						name = name.toLowerCase();

						return name.indexOf(val) >= 0;
					}
			}]);
		}
	},


	studentSort: function() {
		var isDescending = this.studentEl.hasCls('descending'),
			sorter = {
				fn: Globals.getNaturalSorter('displayName'),
				direction: isDescending? 'ASC': 'DESC'
			};


		this.gradeEl.removeCls('sorted ascending descending');

		this.studentEl.addCls('sorted');
		this.studentEl[isDescending? 'removeCls': 'addCls']('descending');
		this.studentEl[isDescending? 'addCls': 'removeCls']('ascending');

		this.store.sort(sorter);

	},


	gradeSort: function() {
		var isDescending = this.gradeEl.hasCls('descending'),
			sorter = {
				property: 'grade',
				direction: isDescending? 'ASC': 'DESC'
			};

		this.studentEl.removeCls('sorted ascending descending');

		this.gradeEl.addCls('sorted');
		this.gradeEl[isDescending? 'removeCls': 'addCls']('descending');
		this.gradeEl[isDescending? 'addCls': 'removeCls']('ascending');

		this.store.sort(sorter);
	},


	clearSearch: function() {
		this.searchKey = '';
		this.inputEl.dom.value = '';
		this.store.removeFilter('searchFilter');
	},


	constructor: function() {
		this.store = new Ext.data.Store({
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
			]
		});
		this.callParent(arguments);
	},


	initComponent: function() {
		this.callParent(arguments);
		this.tpl.ownerCmp = this;
		this.on({
			refresh: 'bindInputs'
		});

		this.createGradeMenu();
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


	setAssignmentStores: function(stores) {
		var me = this,
			feedbackMap = me._feedbackMap = {},
			feedbackListeners = [];


		function gatherFeedbacks(i) {
			var f = i.get('Feedback'),
				c = f && f.get('Creator');

			function updateRow() {
				var r = me.store.getById(c);
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
		var users = [],
			store = this.store, raw = [],
			applyUsers = this.applyUserData.bind(this),
			getCounts = this.getCountsFor.bind(this);

		this.clearAssignmentsData();

		this.gradeBook = gradeBook;
		this.gradeBookDefaultPart = gradeBook && gradeBook.getFieldItem('Items', 'default');

		if (this.exportButton) {
			this.exportButton.set({
				href: gradeBook.getLink('ExportContents')
			});
		}

		this.roster = assignments.getRoster();
		this.roster.forEach(function(r) {
			var u = r.Username;
			users.push(u);
			raw.push(Ext.apply({id: u}, getCounts(u)));
		});

		store.loadRawData(raw);
		UserRepository.getUser(users).done(applyUsers);

		assignments.getViewMaster()
				.done(this.setAssignmentStores.bind(this));
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
		}

		function updateGrade(r, grade) {
			setGrade(r, grade);
			me.mon(grade, 'value-changed', function() {
				setGrade(r, grade);
			});
		}


		if (gradebookentry) {
			this.addCls('show-final-grade');
		}

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
	},


	bindInputs: function() {
		var inputs = this.el.select(this.itemSelector + ' input');
		Ext.destroy(this.gridInputListeners);

		this.gridInputListeners = this.mon(inputs, {
			destroyable: true,
			blur: 'onInputBlur',
			keypress: 'onInputChanged'
		});
	},


	handleEvent: function(e) {
		var isControl = !!e.getTarget('.gradebox');
		if (isControl && e.type === 'click') {
			try {
				if (e.getTarget('.dropdown')) {
					this.onDropDown(e.getTarget(this.itemSelector));
				}
			}
			finally {
				e.stopPropagation();
			}
			return;
		}

		this.callParent(arguments);
	},


	onDropDown: function(node, record) {
		var me = this,
			rec = record || me.getRecord(node),
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

		var p = new Promise(), me = this,
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
		var node = e.getTarget(this.itemSelector),
			rec = node && this.getRecord(node);

		console.log('update record', rec, ' with input value:', input.value);
		this.changeGrade(rec, input.value, rec.get('letter'), fromEnter);
	},


	onItemClick: function(rec) {
		this.fireEvent('student-clicked', this, rec);
	}
});
