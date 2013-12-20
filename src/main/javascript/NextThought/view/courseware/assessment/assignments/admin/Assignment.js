Ext.define('NextThought.view.courseware.assessment.assignments.admin.Assignment', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-assignments-item',

	requires: [
		'NextThought.store.courseware.AssignmentView'
	],

	ui: 'course-assessment',
	cls: 'course-assessment-admin assignment-item',

	layout: 'auto',
	componentLayout: 'natural',
	childEls: ['body'],
	getTargetEl: function() { return this.body; },

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
						{ tag: 'span', cls: 'path part root', html: 'Assignments'},
						{ tag: 'span', cls: 'path part current', html: '{assignmentTitle}'}
					]
				}
			]
		},
		//header
		{
			cls: 'header',
			cn: [
				{ cls: 'title', html: '{assignmentTitle}' },
				{
					cls: 'subtitle',
					cn: [
						{ tag: 'span', cls: 'due', html: 'Due {due:date("l F j, Y")}'},
						{ tag: 'span', cls: 'link', html: 'Request a Change'}
					]
				}
			]
		},
		{ id: '{id}-body', cls: 'body', cn: ['{%this.renderContainer(out,values)%}'] }
	]),


	renderSelectors: {
		rootPathEl: '.toolbar .path.part.root',
		previousEl: '.toolbar .controls .up',
		nextEl: '.toolbar .controls .down'
	},


	listeners: {
		rootPathEl: { click: 'fireGoUp' },
		previousEl: { click: 'firePreviousEvent' },
		nextEl: { click: 'fireNextEvent' }
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
						   { text: 'Student', dataIndex: 'Creator', flex: 1, padding: '0 0 0 30', renderer: function(v) {
							   var u = v && (typeof v === 'string' ? {displayName: 'Resolving...'} : v.getData());
							   return this.studentTpl.apply(u);
						   } },
						   { text: 'Completed', dataIndex: 'Submission', width: 150, renderer: function(v) {
							   var d = this.dueDate, s = v && v.get('Last Modified');
							   if (!s) {
								   return Ext.DomHelper.markup({cls: 'incomplete', html: 'Incomplete'});
							   }
							   if (d > s) {
								   return Ext.DomHelper.markup({cls: 'ontime', html: 'On Time'});
							   }

							   d = new Duration(Math.abs(s - d) / 1000);
							   return Ext.DomHelper.createTemplate({cls: 'late', html: '{late} Late'}).apply({
								   late: d.ago().replace('ago', '').trim()
							   });
						   } },
						   { text: 'Score', dataIndex: 'Grade', width: 90, renderer: function(v) {
							   return v && v.get('value');
						   } },
						   { text: 'Feedback', dataIndex: 'Feedback', width: 140, renderer: function(value) {
							   var items = ((value && value.get('Items')) || []).length;
							   return items ? (items + ' Comments') : '';
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



			studentTpl: Ext.DomHelper.createTemplate({cls: 'student-cell', cn: [
				{ cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'} },
				{ cls: 'name', html: '{displayName}'}
			]})
		}],


	beforeRender: function() {
		var a = this.assignment, s, grid;
		this.callParent();
		this.renderData = Ext.apply(this.renderData || {}, {
			assignmentTitle: this.assignmentTitle,
			due: this.due,
			page: this.page,
			total: this.total
		});

		s = this.store = new NextThought.store.courseware.AssignmentView({
			url: a && a.getLink('GradeSubmittedAssignmentHistory')
		});


		grid = this.down('grid');
		grid.dueDate = a.getDueDate();
		grid.bindStore(s);
		this.mon(s, 'load', 'resolveUsers');
		s.load();
	},


	resolveUsers: function(store, records) {
		console.debug(records);
		var pluck = Ext.Array.pluck,
			users = pluck(pluck(records, 'data'), 'Creator');
		UserRepository.getUser(users)
				.done(function(users) {
					var i = users.length - 1,
						r, u;

					for (i; i >= 0; i--) {
						r = records[i];
						u = users[i];
						if (u && r && r.get('Creator') === u.getId()) {
							r.set('Creator', u);
						} else {
							console.warn('Skipped record!', i, records, users);
						}
					}
				});
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
	}
});
