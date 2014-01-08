Ext.define('NextThought.view.courseware.assessment.assignments.admin.Assignment', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-admin-assignments-item',

	requires: [
		'NextThought.store.courseware.AssignmentView'
	],

	ui: 'course-assessment',
	cls: 'course-assessment-header assignment-item',

	layout: 'fit',
	componentLayout: 'natural',
	childEls: ['body'],
	getTargetEl: function() { return this.body; },

	pathRoot: 'Assignments',

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
		nextEl: '.toolbar .controls .down',
		changeDateEl: '.header span.link'
	},


	listeners: {
		rootPathEl: { click: 'fireGoUp' },
		previousEl: { click: 'firePreviousEvent' },
		nextEl: { click: 'fireNextEvent' },
		changeDateEl: { click: 'requestDateChange' }
	},


	items: [
		{
			xtype: 'grid',
			ui: 'course-assessment',
			plain: true,
			border: false,
			frame: false,
			cls: 'student-assignment-overview',
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
						   { text: 'Student', dataIndex: 'Creator', flex: 1, padding: '0 0 0 30', renderer: function(v) {
							   var u = v && (typeof v === 'string' ? {displayName: 'Resolving...'} : v.getData());
							   return this.studentTpl.apply(u);
						   } },
						   { text: 'Completed', dataIndex: 'submission', width: 150, renderer: function(v) {
							   var d = this.dueDate,
								   s = (v && v.get && v.get('Last Modified')) || v;
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
							   v = v && v.get('value');
							   return v && v.split(' ')[0];
						   }, listeners: {
								headerclick: function() {
									var store = this.up('grid').getStore(),
										sorter = Ext.create('Ext.util.Sorter', {
										direction: this.sortState,
										sorterFn: function(o1, o2) {
											o1 = o1 && o1.get('Grade');
											o1 = o1 && o1.get('value');
											o1 = o1 && o1.split(' ')[0];
											o1 = o1 || '';

											o2 = o2 && o2.get('Grade');
											o2 = o2 && o2.get('value');
											o2 = o2 && o2.split(' ')[0];
											o2 = o2 || '';

											return Globals.naturalSortComparator(o1, o2);
										}
									});

								store.sorters.clear();
								store.sorters.add('answers', sorter);
								store.sort();
							}
						}},
						   { text: 'Feedback', dataIndex: 'feedback', width: 140, renderer: function(items) {
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



			studentTpl: Ext.DomHelper.createTemplate({cls: 'padded-cell student-cell', cn: [
				{ cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'} },
				{ cls: 'name', html: '{displayName}'}
			]})
		}],


	initComponent: function() {
		this.callParent(arguments);
		this.enableBubble(['show-assignment']);
		this.filledStorePromise = new Promise();
	},


	beforeRender: function() {
		var a = this.assignment, s, grid;
		this.callParent();
		this.pathBranch = this.assignmentTitle;
		this.renderData = Ext.apply(this.renderData || {}, {
			pathRoot: this.pathRoot,
			pathBranch: this.pathBranch,
			assignmentTitle: this.assignmentTitle,
			due: this.due,
			page: this.page,
			total: this.total
		});

		s = this.store = new NextThought.store.courseware.AssignmentView({
			url: a && a.getLink('GradeSubmittedAssignmentHistory'),
			sorters: {
				sorterFn: Globals.getCaseInsensitiveNaturalSorter('Creator')
			}
		});


		grid = this.down('grid');
		grid.dueDate = a.getDueDate();
		grid.bindStore(s);
		this.mon(s, 'load', 'resolveUsers');
		s.load();

		this.mon(grid, 'itemclick', 'goToAssignment');
	},


	resolveUsers: function(store, records) {
		records = records || [];

		var pluck = Ext.Array.pluck, me = this,
			users = pluck(pluck(records, 'data'), 'Creator'),
			phantoms = [];

		this.roster.forEach(function(o) {
			if (!Ext.Array.contains(users, o.Username)) {
				phantoms.push(new NextThought.model.courseware.UsersCourseAssignmentHistoryItem({
					Creator: o.Username
				}));
				users.push(o.Username);
			}
		});

		if (phantoms.length) {
			records = records.concat(phantoms);
			store.add(phantoms);
		}

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

					me.filledStorePromise.fulfill(store);
					store.sort();
				}).fail(function(reason) {
					me.filledStorePromise.fail(reason);
					console.error(reason);
				});


	},


	requestDateChange: function() {
		Globals.sendEmailTo(
				'support@nextthought.com',
				Ext.String.format('[CHANGE REQUEST] ({0}) {1}: {2}',
						location.hostname,
						$AppConfig.username,
						this.assignmentTitle)
		);
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
	},

	goToAssignment: function(selModel, record) {
		var student = record.get('Creator'),
			path = [
				this.pathRoot,
				this.pathBranch,
				student.toString()
		];

		if (typeof student === 'string') {
			return;
		}

		this.fireEvent('show-assignment', this, this.assignment, record, student, path, this.store, this.store.indexOf(record) + 1);
	}
});
