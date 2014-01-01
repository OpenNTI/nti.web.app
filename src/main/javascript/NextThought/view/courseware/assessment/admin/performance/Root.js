Ext.define('NextThought.view.courseware.assessment.admin.performance.Root', {
	extend: 'Ext.view.View',
	alias: 'widget.course-assessment-admin-performance-root',

	ui: 'course-assessment',
	cls: 'course-assessment-admin performance',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header assignment-filterbar', cn: [
			{ cls: 'third dropmenu disabled', cn: [
				{ cls: 'label', html: 'All Students' }
			] },
			{ cls: 'third dropmenu', cn: [
				{ cls: 'label', html: 'By Performance' }
			] },
			{ cls: 'third search', cn: [
				{ tag: 'input', type: 'text', placeholder: 'Search Students', required: 'required' },
				{ cls: 'clear' }
			] }
		]},
		{
			cls: 'scrollzone scrollable',
			cn: [
				{
					cls: 'column-names',
					cn: [
						{cls: 'right', html: 'Course Grade'},
						{html: 'Student'}
					]
				},
				{ cls: 'list'}
			]
		}
	]),

	renderSelectors: {
		titleEl: '.header',
		frameBodyEl: '.list'
	},

	getTargetEl: function() { return this.frameBodyEl; },
	itemSelector: '.item',
	tpl: new Ext.XTemplate(
			Ext.DomHelper.markup(
					{ tag: 'tpl', 'for': '.', cn: [
						{ cls: 'item', cn: [
							{ cls: 'gradebox', cn: [
								{ tag: 'input', size: 3, type: 'text', value: '{grade}'},
								{ cls: 'dropdown letter grade', html: '{letter}'}
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


	constructor: function() {
		this.store = new Ext.data.Store({
			fields: [
				{name: 'id', type: 'string'},
				{name: 'user', type: 'auto'},
				{name: 'avatar', type: 'stirng', defaultValue: 'resources/images/icons/unresolved-user.png'},
				{name: 'displayName', type: 'stirng', defaultValue: 'Resolving...'},
				{name: 'grade', type: 'string'},
				{name: 'letter', type: 'string', defaultValue: '-'},
				{name: 'comments', type: 'int', defaultValue: 0},
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


	createGradeMenu: function(){
		this.gradeMenu = Ext.widget('menu',{
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
				{text: 'A'},
				{text: 'B'},
				{text: 'C'},
				{text: 'D'},
				{text: 'F'},
				{text: '-'}
			]
		});
	},


	setAssignmentsData: function(assignments, history, outline, instance, gradeBook) {
		var users = Ext.Array.pluck(this.roster, 'Username');

		this.clearAssignmentsData();

		this.history = history;
		this.gradeBook = gradeBook;
		this.gradeBookDefaultPart = gradeBook && gradeBook.getFieldItem('Items', 'default');

		this.store.loadRawData(users.map(this.getDataFor.bind(this)));
		UserRepository.getUser(users).done(this.applyUserData.bind(this));

	},


	clearAssignmentsData: function() { this.clear(); },


	getDataFor: function(username) {
		return Ext.apply({id: username}, this.getCountsFor(username));
	},


	getCountsFor: function(username) {
		var d = this.gradeBookDefaultPart,
			assignments = (d && d.get('Items')) || [],
			history = this.history,
			counts = {ungraded: 0, overdue: 0, comments: 0};

		assignments.forEach(function(assignment) {
			var i = assignment.getFieldItem('Items', username),
				h = history.getItem(assignment.get('AssignmentId'));

			if (i && !i.get('value')) {counts.ungraded++;}
			if (!i && assignment.get('DueDate') < new Date()) {counts.overdue++;}
			//feedbacks, will we have a history item?
			if (h) {
				counts.comments += h.get('Items').filter(function(f) {
					return f.get('Creator') === username;}).length;
			}
		});

		return counts;
	},


	applyUserData: function(users) {
		var me = this,
			s = me.store, r;

		users.forEach(function(u) {
			var gradebookentry = me.gradeBook.getItem('Final Grade', 'no_submit'),
				grade = gradebookentry && gradebookentry.getFieldItem('Items', u.getId()),
				value = grade && grade.get('value'),
				grades = value && value.split(' '),
				number = grades && grades[0],
				letter = grades && grades[1] || '-';

			r = s.getById(u.getId());
			r.set({
				user: u,
				avatar: u.get('avatarURL'),
				displayName: u.toString(),
				grade: number,
				letter: letter
			});
		});
	},


	bindInputs: function() {
		var inputs = this.el.select(this.itemSelector + ' input');
		Ext.destroy(this.gridInputListeners);

		this.gridInputListeners = this.mon(inputs, {
			destroyable: true,
			blur: 'onInputBlur'
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


	onDropDown: function(node) {
		var me = this,
			rec = me.getRecord(node),
			el = Ext.get(node),
			dropdown = el && el.down('.gradebox .letter');
		console.log('show menu for record:', rec);
		
		me.gradeMenu.items.each(function(item, index){
			var x = item.height * index;

			if(item.text === rec.get('letter')){
				item.setChecked(true, true);
				me.gradeMenu.offset = [-1, -x];
			} else {
				item.setChecked(false, true);
			}
		});

		if(dropdown){
			me.gradeMenu.showBy(dropdown, 'tl-tl', me.gradeMenu.offset);
			this.activeGradeRecord = rec;

		}
	},


	changeLetterGrade: function(item){
		if(!this.activeGradeRecord){ return; }

		this.activeGradeRecord.set('letter', item.text);
		this.changeGrade(this.activeGradeRecord, this.activeGradeRecord.get('grade'), item.text);
	},


	changeGrade: function(rec, number, letter){
		if(!this.gradeBook){ return; }

		var value = number + ' ' + letter,
			url = this.gradeBook.get('href');

		url += '/no_submit/Final Grade/'+rec.getId();

		Ext.Ajax.request({
			url: url,
			method: 'PUT',
			jsonData: { value: value },
			failure: function(){
				//probably should do something here
				console.error('Failed to save final grade:', arguments);
			}
		});
	},


	onInputBlur: function(e, input) {
		var node = e.getTarget(this.itemSelector),
			rec = node && this.getRecord(node);
			
		console.log('update record', rec, ' with input value:', input.value);
		this.changeGrade(rec, input.value, rec.get('letter'));
	},


	onItemClick: function(rec) {
		this.fireEvent('student-clicked', this, rec);
	}
});
