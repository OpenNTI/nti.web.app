Ext.define('NextThought.view.courseware.assessment.admin.performance.Student', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-performance-student',

	requires: [
	],

	mixins: {
		enableProfiles: 'NextThought.mixins.ProfileLinks',
		enableChat: 'NextThought.mixins.ChatLinks'
	},

	profileLinkCard: false,

	ui: 'course-assessment',
	cls: 'course-assessment-admin assignment-item',

	layout: 'auto',
	componentLayout: 'natural',
	childEls: ['body'],
	getTargetEl: function() { return this.body; },

	pathRoot: 'Grades & Performance',

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
				{ cls: 'grade', cn: [
					{ cls: 'label', html: 'Course Grade'},
					{ cls: 'gradebox', cn: [
						{ tag: 'input', size: 3, type: 'text', value: '{grade}'},
						{ cls: 'dropdown letter grade', html: '{letter}'}
					]}
				]},
				{ cls: 'user', cn: [
					{ cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'}},
					{ cls: 'wrap', cn: [
						{ cls: 'title name {presence}', cn: {html: '{displayName}' }},
						{ cls: 'subtitle actions', cn: [
							{ tag: 'span', cls: 'profile link', html: 'Profile'},
							{ tag: 'span', cls: 'email link', html: 'Email'},
							{ tag: 'span', cls: 'chat link', html: 'Chat'}
						]}
					]}
				]}
			]
		},
		{ id: '{id}-body', cls: 'body', cn: ['{%this.renderContainer(out,values)%}'] }
	]),


	renderSelectors: {
		rootPathEl: '.toolbar .path.part.root',
		previousEl: '.toolbar .controls .up',
		nextEl: '.toolbar .controls .down',
		nameEl: '.header .user .wrap .name',
		profileEl: '.header .user .wrap .actions .profile',
		emailEl: '.header .user .wrap .actions .email',
		chatEl: '.header .user .wrap .actions .chat'
	},


	listeners: {
		rootPathEl: { click: 'fireGoUp' },
		previousEl: { click: 'firePreviousEvent' },
		nextEl: { click: 'fireNextEvent' },
		emailEl: { click: 'openEmail'},
		chatEl: { click: 'startChat'}
	},


	items: [
		{
			xtype: 'grid',
			ui: 'course-assessment',
			plain: true,
			border: false,
			frame: false,
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
						   { text: 'Assignment', dataIndex: 'name', tdCls: 'padded-cell', padding: '0 0 0 30', flex: 1 },
						   { text: 'Completed', dataIndex: 'Submission', width: 150, renderer: function(v) {
							   var d = new Date(0),
								   s = v && v.get('Last Modified');
							   if (!s) {
								   return Ext.DomHelper.markup({cls: 'incomplete', html: 'Due ' + Ext.Date.format(d, 'd/m')});
							   }
							   if (d > s) {
								   return Ext.DomHelper.markup({cls: 'ontime', html: 'On Time'});
							   }

							   d = new Duration(Math.abs(s - d) / 1000);
							   return Ext.DomHelper.createTemplate({cls: 'late', html: '{late} Late'}).apply({
								   late: d.ago().replace('ago', '').trim()
							   });
						   } },
						   { text: 'Score', dataIndex: 'Grade', width: 70 },
						   { text: 'Feedback', dataIndex: 'feedback', width: 140, renderer: function(value) {
							   return value ? (value + ' Comments') : '';
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
			}
		}],


	initComponent: function() {
		var grid, store;
		this.callParent(arguments);
		this.enableBubble(['show-assignment']);
		grid = this.down('grid');
		store = this.store = new Ext.data.Store({
			fields: [
				{name: 'ntiid', type: 'string'},
				{name: 'name', type: 'string'},
				{name: 'Submission', type: 'date'},
				{name: 'Grade', type: 'auto'},
				{name: 'feedback', type: 'int'}
			],
			sorters: [
				{property: 'due', direction: 'DESC'}
			]
		});
		grid.bindStore(store);
		this.mon(grid, 'itemclick', 'goToAssignment');
	},


	beforeRender: function() {
		this.callParent();
		this.pathBranch = this.student.toString();
		this.renderData = Ext.apply(this.renderData || {}, {
			displayName: this.student.toString(),
			pathRoot: this.pathRoot,
			pathBranch: this.pathBranch,
			avatarURL: this.student.get('avatarURL'),
			presence: this.student.getPresence().getName(),
			grade: '100',
			letter: 'A',
			page: this.page,
			total: this.total
		});
	},


	afterRender: function(){
		var me = this;

		me.callParent(arguments);

		//so the elements wont take up space when hidden
		Object.keys(this.renderSelectors).forEach(function(s){ 
			me[s].setVisibilityMode(Ext.Element.DISPLAY); 
		});

		//for profile link
		me.user = me.student;
		me.enableProfileClicks(me.profileEl);

		if(!me.user.get('email')){
			me.emailEl.hide();
		}

		me.maybeShowChat(me.chatEl);

		this.mon(Ext.getStore('PresenceInfo'), 'presence-changed', function(username, presence){
			if(username === me.user.getId()){
				me.nameEl.removeCls('dnd away available unavailable');
				me.nameEl.addCls(presence.getName());
				me.maybeShowChat(me.chatEl);
			}
		});
	},


	setAssignmentsData: function(data, history, outline, instance, gradeBook) {
		var ntiid, raw = [];

		if (!data) {
			console.error('No data??');
			return;
		}

		function collect(o) {
			var id = o.getId(),
				h = history.getItem(id),
				submission = h && h.get('Submission'),
				feedback = h && h.get('Feedback'),
				grade = h && h.get('Grade');

			raw.push({
				ntiid: id,
				containerId: o.get('containerId'),
				item: o,
				name: o.get('title'),
				assigned: o.get('availableBeginning'),
				due: o.get('availableEnding'),
				completed: submission && submission.get('CreatedTime'),
				Grade: grade && grade.get('grade'),
				average: grade && grade.get('average'),
				feedback: feedback && feedback.get('Items').length
			});
		}

		delete data.href;//all other keys are container ids...so, lets just drop it.

		for (ntiid in data) {
			if (data.hasOwnProperty(ntiid)) {
				if (!ParseUtils.isNTIID(ntiid)) {//just to be safe
					console.warn('[W] Ignoring:', ntiid);
					continue;
				}
				ParseUtils.parseItems(data[ntiid]).forEach(collect);
			}
		}

		this.store.loadRawData(raw);
	},


	openEmail: function(){
		var email = this.student.get('email');

		if(email){
			Globals.sendEmailTo(email);
		}
	},


	//<editor-fold desc="Navigation Events">
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


	goToAssignment: function(selModel, record) {
		var path = [
				this.pathRoot,
				this.pathBranch,
				record.get('name')
		];
		this.fireEvent('show-assignment', this, record, this.student, path, this.store, this.store.indexOf(record) + 1);
	}
	//</editor-fold>
});
