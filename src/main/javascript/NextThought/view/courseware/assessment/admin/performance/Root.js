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
	},


	setAssignmentsData: function(assignments, history, outline) {
		var ntiid, me = this,
			users = Ext.Array.pluck(this.roster, 'Username');

		this.clearAssignmentsData();


		this.store.loadRawData(users.map(function(u) { return { id: u }; }));
		UserRepository.getUser(users).done(this.applyUserData.bind(this));

		if (!assignments) {
			console.error('No data??');
			return;
		}

		delete assignments.href;//all other keys are container ids...so, lets just drop it.

		function collect(agg, o) { me.collectEvents(o, history); }

		for (ntiid in assignments) {
			if (assignments.hasOwnProperty(ntiid)) {
				if (!ParseUtils.isNTIID(ntiid)) {//just to be safe
					console.warn('[W] Ignoring:', ntiid);
					continue;
				}

				ParseUtils.parseItems(assignments[ntiid]).reduce(collect, 0);
			}
		}
	},


	clearAssignmentsData: function() { this.clear(); },



	applyUserData: function(users) {
		var s = this.store, r;

		users.forEach(function(u) {
			r = s.getById(u.getId());
			r.set({
				user: u,
				avatar: u.get('avatarURL'),
				displayName: u.toString()
			});
		});
	},


	collectEvents: function(o, history) {

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
		var rec = this.getRecord(node);
		console.log('show menu for record:', rec);
	},


	onInputBlur: function(e, input) {
		var node = e.getTarget(this.itemSelector),
			rec = node && this.getRecord(node);

		console.log('update record', rec, ' with input value:', input.value);
	},


	onItemClick: function(rec) {
		console.log('Show User View:', rec);
	}
});
