/*globals swallow*/
Ext.define('NextThought.view.courseware.assessment.admin.performance.Root', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance-root',

	mixins: {
		gridGrades: 'NextThought.mixins.grid-feature.GradeInputs'
	},

	requires: [
		'NextThought.view.courseware.assessment.admin.PagedGrid',
		'NextThought.view.courseware.assessment.admin.Pager'
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
						{
							tag: 'input',
							type: 'text',
							placeholder: getString('NextThought.view.courseware.assessment.admin.performance.Root.search'),
							required: 'required'
						},
						{ cls: 'clear' }
					] }
				]},
				{
					cls: 'tools',
					cn: [
						{ tag: 'a', href: '{exportLink}', cls: 'download button', html: getString('NextThought.view.courseware.assessment.admin.performance.Root.export')},
						{ cls: 'toggle-avatar enabled', html: 'Hide Avatars'}
					]
				}
			]},
			renderSelectors: {
				studentEl: '.student',
				itemEl: '.item',
				inputEl: '.search input',
				clearEl: '.search .clear',
				exportButton: 'a.download.button',
				avatarEl: '.toggle-avatar',
				previousPageEl: '.tools .pager .previous-page',
				nextPageEl: '.tools .pager .next-page'
			}
		},
		{ xtype: 'course-assessment-admin-pager'},
		{
			anchor: '0 -115',
			xtype: 'course-admin-paged-grid',
			columnOrder: ['Student', 'Username', 'Grade'],
			columnOverrides: {
				Student: {
					tpl: new Ext.XTemplate(Ext.DomHelper.markup([
						{cls: 'studentbox', cn: [
							{cls: 'avatar', style: {backgroundImage: 'url({avatar})'}},
							{cls: 'wrap', cn: [
								{cls: 'name', html: '{[this.displayName(values)]}'},
								{cls: 'action-items', cn: [
									{tag: 'tpl', 'if': 'OverdueAssignmentCount &gt; 0', cn:
										{cls: 'overdue', html: '{OverdueAssignmentCount:plural("Assignment")} Overdue'}
									},
									{tag: 'tpl', 'if': 'UngradedAssignmentCount &gt; 0', cn:
										{cls: 'overdue', html: '{UngradedAssignmentCount:plural("Ungraded Assignment")}'}
									}
								]}
							]}
						]}
					]), {
						displayName: function(values) {
							//TODO: highlight search values
							return values.Alias;
						}
					})
				},
				Grade: { dataIndex: 'FinalGrade', sortOn: 'Grade', width: 150}
			}
		}
	],


	initComponent: function() {
		var me = this;

		me.callParent(arguments);
		me.supported = true;
		me.grid = me.down('grid');
		me.pager = me.down('course-assessment-admin-pager');
		me.header = me.down('box');
		me.createGradeMenu();

		$AppConfig.Preferences.getPreference('Gradebook')
			.then(function(value) {
				me.toggleAvatars(!value.get('hide_avatars'));
			});
	},


	restoreState: function(state) {
		var me = this,
			params, store = me.store,
			storeState = (state && state.rootStore) || {};

		if (!me.store) {
			me.initialState = state;
		}

		me.currentStudent = storeState.student || 'ForCredit';

		me.currentItem = storeState.item || 'all';

		params = me.__getParams();

		store.proxy.extraParams = Ext.apply(store.proxy.extraParams || {}, params);

		me.updateUIFromRestore();

		return new Promise(function(fulfill, reject) {
			me.mon(store, {
				single: true,
				'records-filled-in': function() {
					delete store.proxy.extraParams.batchAroundUsernameFilterByScope;

					fulfill();
				}
			});

			this.stateRestored = true;

			if (state && state.activeStudent) {
				store.proxy.extraParams.batchAroundUsernameFilterByScope = state.activeStudent;

				store.load();
			} else if (storeState.page) {
				store.loadPage(parseInt(storeState.page, 10));
			} else {
				store.loadPage(1);
			}
		});
	},

	/**
	 * Make sure the UI is synced to what ever state we restored
	 */
	updateUIFromRestore: function() {
		if (!this.rendered) {
			this.on('afterrender', 'updateUIFromRestore');
			return;
		}

		var student = this.studentMenu.down('[type="' + this.currentStudent + '"]'),
			item = this.itemMenu.down('[type="' + this.currentItem + '"]');

		if (student) { this.updateStudentUI(student); }

		if (item) { this.updateItemUI(item); }
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
			clearEl: {click: 'clearSearch', scope: this},
			avatarEl: {click: 'toggleAvatarsClicked', scope: this}
		});

		this.mon(this.grid, {
			cellclick: 'onCellClick'
		});

		if (!this.stateRestored) {
			this.currentStudent = 'ForCredit';
			this.currentItem = 'all';

			this.store.proxy.extraParams = Ext.apply(this.store.proxy.extraParams || {}, this.__getParams());
			this.updateUIFromRestore();

			this.store.load(1);
		}
	},
	//</editor-fold>

	toggleAvatarsClicked: function(e) {
		this.toggleAvatars(!e.getTarget('.enabled'));
	},


	toggleAvatars: function(show) {
		if (!this.rendered) {
			this.on('afterrender', this.toggleAvatars.bind(this, show));
			return;
		}

		var avatarEl = this.header.avatarEl;

		if (show) {
			avatarEl.update('Hide Avatars');
			avatarEl.removeCls('disabled');
			avatarEl.addCls('enabled');
			this.removeCls('hide-avatars');
		} else {
			avatarEl.update('Show Avatars');
			avatarEl.removeCls('enabled');
			avatarEl.addCls('disabled');
			this.addCls('hide-avatars');
		}

		$AppConfig.Preferences.getPreference('Gradebook')
			.then(function(value) {
				value.set('hide_avatars', !show);
				value.save();
			});
	},


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
	},


	showStudentMenu: function() {
		this.studentMenu.showBy(this.header.studentEl, 'tl-tl?', this.studentMenu.offset);
	},


	updateStudentUI: function(item) {
		var offset, x;

		try {
			offset = item.getOffsetsTo(this.studentMenu);
			x = offset && offset[1];
			this.header.studentEl.el.down('.label').update(item.text);
		} catch (e) {
			swallow(e);
		}

		this.studentMenu.offset = [0, x ? -x : 0];

		x = this.down('[dataIndex="Username"]');

		x[item.type === 'ForCredit' ? 'show' : 'hide']();

		this.updateExportEl(item.type);
	},


	switchStudent: function(item, status, opts, noEmpty) {
		if (!status) { return; }

		this.currentStudent = item.type;

		this.updateStudentUI(item);


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
		var gradebook = this.assignments.getGradeBook(),
			base = gradebook && gradebook.getLink('ExportContents');

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
				{ text: getString('NextThought.view.courseware.assessment.admin.performance.Root.actionoption'), type: 'actionable', checked: type === 'actionable'},
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

		this.itemMenu.show().hide();
	},


	showItemMenu: function() {
		this.itemMenu.showBy(this.header.itemEl, 'tl-tl?', this.itemMenu.offset);
	},


	updateItemUI: function(item) {
		var offset = item && item.getOffsetsTo(this.itemMenu),
			x = offset ? offset[1] : 1;

		this.header.itemEl.el.down('.label').update(item.text);

		this.itemMenu.offset = [0, x ? -x : 0];
	},


	switchItem: function(item, status) {
		if (!status) { return; }

		this.currentItem = item.type;

		this.updateItemUI(item);

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


	__getParams: function() {
		var filters = [],
			params = {};

		filters.push(this.currentStudent || 'ForCredit');

		if (this.currentItem && !/all/i.test(this.currentItem)) {
			filters.push(this.currentItem);
		}

		if (!Ext.isEmpty(this.searchKey)) {
			params.search = this.searchKey;
		} else {
			delete params.search;
		}

		params.filter = filters.join(',');

		return params;
	},


	updateFilter: function() {
		var s = this.store,
			params = this.__getParams();

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams || {}, params);

		s.load();
	},


	setAssignmentsData: function(assignments, instance) {
		var page = this.initialState && this.initialState.page;

		this.clearAssignmentsData();

		this.assignments = assignments;

		this.store = assignments.getGradeSummaries();

		if (assignments.hasFinalGrade()) {
			this.addCls('show-final-grade');
		}

		this.mon(this.store, 'load', 'syncStateToStore');

		this.pager.bindStore(this.store);

		this.grid.bindStore(this.store);


		if (page) {
			this.store.loadPage(page);
		}

		return Promise.resolve();
	},


	syncStateToStore: function() {
		var state = {};

		//push the current page, student filter, and item filter to the state
		state.page = this.store.currentPage || 1;
		state.student = this.currentStudent || 'ForCredit';
		state.item = this.currentItem || 'all';

		this.pushState({rootStore: state});
	},


	clear: function() {
		//this.store.removeAll();
	},


	clearAssignmentsData: function() { this.clear(); },


	updateActionables: function(username) {},


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
				{text: 'F'},
				{text: 'I'},
				{text: 'W'}
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


	editGrade: function(record, value, letter) {
		var me = this,
			view = me.__getGridView(),
			node = view.getNode(record),
			historyItem = record.get('HistoryItemSummary'),
			grade = historyItem.get('Grade'),
			oldValues = grade && grade.getValues(),
			save;

		//if a letter has not been passed use the old one
		if (!letter) {
			letter = oldValues && oldValues.letter;
		}

		if (!historyItem || !historyItem.shouldSaveGrade(value, letter)) { return; }


		if (node) {
			Ext.fly(node).setStyle({opacity: '0.3'});
		}

		wait(300).then(function() {
			return historyItem.saveGrade(value, letter);
		}).always(function() {
			var n = view.getNode(record);

			if (n) {
				Ext.fly(n).setStyle({opacity: 1});
			}
		});
	}
	//</editor-fold>
});
