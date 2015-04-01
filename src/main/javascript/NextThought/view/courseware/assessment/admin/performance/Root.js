/*globals swallow*/
Ext.define('NextThought.view.courseware.assessment.admin.performance.Root', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance-root',

	mixins: {
		gridGrades: 'NextThought.mixins.grid-feature.GradeInputs'
	},

	requires: [
		'NextThought.view.courseware.assessment.admin.PagedGrid',
		'NextThought.view.courseware.assessment.admin.ListHeader'
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
				]}
			]},
			renderSelectors: {
				studentEl: '.student',
				itemEl: '.item',
				inputEl: '.search input',
				clearEl: '.search .clear'
			}
		},
		{ xtype: 'course-assessment-admin-listheader'},
		{
			anchor: '0 -90',
			xtype: 'course-admin-paged-grid',
			columnOrder: ['Student', 'Username', 'PredictedGrade', 'Grade'],
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
							if (!values.User || !values.User.isModel) {
								return 'Resolving';
							}

							var creator = values.User,
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
								d = Ext.DomHelper.markup({cls: 'accent-name', 'data-qtip': d, html: d});
							}

							return d;
						}
					})
				},
				Grade: { dataIndex: 'FinalGrade', sortOn: 'Grade', width: 150}
			},
			extraColumns: {
				PredictedGrade: {
					dataIndex: 'PredictedGrade',
					sortOn: 'PredictedGrade',
					width: 120,
					text: Ext.DomHelper.markup({
						cls: 'disclaimer-header', 'data-qtip': 'Estimated from the grading policy in the Syllabus', html: 'Course Grade'
					})
				}
			}
		}
	],


	initComponent: function() {
		var me = this;

		me.callParent(arguments);
		me.supported = true;
		me.grid = me.down('grid');
		me.pageHeader = me.down('course-assessment-admin-listheader');
		me.header = me.down('box');
		me.createGradeMenu();

		me.hidePredicted();

		$AppConfig.Preferences.getPreference('Gradebook')
			.then(function(value) {
				me.pageHeader.setAvatarToggle(!value.get('hide_avatars'));
			});
	},


	restoreState: function(state, fromAfterRender) {
		var me = this,
			params, store = me.store,
			storeState = (state && state.rootStore) || {};

		//if this is coming form after render and we've already restored
		//a state don't overwrite it. The main reason this is here is so
		//if they hit the back button the component is already rendered with
		//a state so we want to override it, but if we are coming from after
		//render we don't want to override a previous state.
		if (fromAfterRender && me.stateRestored) {
			return;
		}

		if (!me.store) {
			me.initialState = state;
		}

		me.stateRestored = true;

		//if we have an active student don't at the scope filter
		if (!state || !state.activeStudent) {
			me.currentStudent = storeState.student || 'ForCredit';
		}

		me.currentItem = storeState.item || 'all';

		params = me.__getParams();

		store.proxy.extraParams = Ext.apply(store.proxy.extraParams || {}, params);

		if (storeState.pageSize) {
			store.setPageSize(storeState.pageSize);
		}

		if (storeState.sortOn) {
			store.sort(storeState.sortOn, storeState.sortDirection, null, false);
		}

		//if we have an active student set the current scope filter so the UI will sync properly
		if (state && state.activeStudent) {
			me.currentStudent = storeState.student || 'ForCredit';
		}

		me.updateUIFromRestore();

		return new Promise(function(fulfill, reject) {
			me.mon(store, {
				single: true,
				'records-filled-in': function() {
					delete store.proxy.extraParams.batchAroundUsernameFilterByScope;

					fulfill();

					me.currentPage = store.getCurrentPage();

					me.maybeSwitchStudents();

					me.initialLoad = true;
				}
			});

			if (storeState.page) {
				store.loadPage(parseInt(storeState.page, 10));
			} else if (state && state.activeStudent) {
				store.proxy.extraParams.batchAroundUsernameFilterByScope = state.activeStudent;

				store.load();
			} else {
				store.loadPage(1);
			}
		});
	},


	hidePredicted: function() {
		var column = this.grid.down('[dataIndex=PredictedGrade]');

		if (column) {
			column.hide();
		}
	},


	maybeShowPredicted: function() {
		var rec = this.store.getRange()[0],
			column = this.grid.down('[dataIndex=PredictedGrade]');

		if (rec && rec.raw.hasOwnProperty('PredictedGrade')) {
			column.show();
		}
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

		this.updateExportEl(this.currentStudent);

		this.mon(this.header, {
			studentEl: {click: 'showStudentMenu', scope: this},
			itemEl: {click: 'showItemMenu', scope: this},
			inputEl: {keyup: 'changeNameFilter', scope: this, buffer: 350},
			clearEl: {click: 'clearSearch', scope: this}
		});

		this.mon(this.grid, {
			cellclick: 'onCellClick'
		});

		this.mon(this.pageHeader, 'toggle-avatars', 'toggleAvatars');

		if (!this.stateRestored) {
			//bump this to the next event pump so the restore state has a chance to be called
			wait().then(this.restoreState.bind(this, {}, true));
		}
	},
	//</editor-fold>


	toggleAvatars: function(show) {
		if (!this.rendered) {
			this.on('afterrender', this.toggleAvatars.bind(this, show));
			return;
		}

		if (show) {
			this.removeCls('hide-avatars');
		} else {
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


	maybeSwitchStudents: function() {
		if (this.initialLoad || this.store.getCount() > 0) { return; }

		var scope = this.store.proxy.reader.EnrollmentScope,
			menu = this.studentMenu,
			open = menu.down('[type=Open]'),
			credit = menu.down('[type=ForCredit]');

		if (scope === 'ForCredit') {
			open.setChecked(true);
		} else {
			credit.setChecked(true);
		}
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
			url,
			base = gradebook && gradebook.getLink('ExportContents');

		if (!base) {
			this.pageHeader.setExportURL();
			return;
		}

		if (type === 'Open') {
			url = base + '?LegacyEnrollmentStatus=Open';
			this.pageHeader.setExportURL(url, getString('NextThought.view.courseware.assessment.admin.performance.Root.exportopen'));
		} else {
			url = base + '?LegacyEnrollmentStatus=ForCredit';
			this.pageHeader.setExportURL(url, getString('NextThought.view.courseware.assessment.admin.performance.Root.exportenrolled'));
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


	__getParams: function(params) {
		params = params || {};

		var filters = [];

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
			params = this.__getParams(s.proxy.extraParams);

		s.proxy.extraParams = params;

		s.loadPage(1);
	},


	setAssignmentsData: function(assignments, instance) {
		var page = this.initialState && this.initialState.page;

		this.clearAssignmentsData();

		this.assignments = assignments;

		this.store = assignments.getGradeSummaries();

		if (assignments.hasFinalGrade()) {
			this.addCls('show-final-grade');
		}

		//Comment this out for now so we can test the state
		//with out dealing with the store
		this.mon(this.store, 'load', 'syncStateToStore');

		this.pageHeader.bindStore(this.store);

		this.grid.bindStore(this.store);


		if (page) {
			this.store.loadPage(page);
		}

		return Promise.resolve();
	},


	syncStateToStore: function() {
		var state = {}, store = this.store,
			page = store.getCurrentPage(),
			sort = (store.getSorters() || [])[0];

		this.maybeShowPredicted();

		state.pageSize = store.pageSize;
		state.student = this.currentStudent || 'ForCredit';
		state.item = this.currentItem || 'all';

		if (sort) {
			state.sortOn = sort.property;
			state.sortDirection = sort.direction;
		}

		if (page !== this.currentPage && this.currentPage) {
			state.page = page;
			this.currentPage = page;

			this.pushState({rootStore: state});
		} else {
			this.replaceState({rootStore: state});
		}
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
