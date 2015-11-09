Ext.define('NextThought.app.course.assessment.components.student.assignments.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-assignments',

	state_key: 'course-assessment-assignments',

	mixins: {
		Router: 'NextThought.mixins.Router',
		State: 'NextThought.mixins.State'
	},

	requires: [
		'NextThought.common.ux.Grouping',
		'NextThought.app.navigation.path.Actions',
		'NextThought.app.course.assessment.components.student.assignments.FilterBar',
		'NextThought.app.course.assessment.components.student.assignments.List'
	],

	handlesAssignment: true,
	layout: 'none',
	cls: 'course-assessment-assignments',
	items: [
		{xtype: 'course-assessment-assignments-filterbar'},
		{xtype: 'container', rel: 'content'}
			/* Exmaple items:
				{xtype: 'grouping', title: '1. About Geology', subTitle: 'August 19', items: [
					{ xtype: 'course-assessment-assignment-list' }
				]}
			*/
	],


	grouperMap: {
		'lesson': 'lesson',
		'completion': {
			'property': 'completed',
			'getGroupString': function(val) {
				return val.get('completed') ?
					getString('NextThought.view.courseware.assessment.assignments.View.complete') :
					getString('NextThought.view.courseware.assessment.assignments.View.incomplete');
			}
		},
		'due': {
			'property': 'due',
			'direction': 'ASC',
			'getGroupString': function(val) {
				var today = (new Date()).setHours(0, 0, 0),
					due = val.get('due'),
					day = due && (new Date(due.getTime())).setHours(0, 0, 0);

				if (!due) {
					return '';
				}

				if (day === today) {
					//its due today
					return 'Today';
				}
				return Ext.Date.format(val.get('due'), 'F j, Y');
			}
		}
	},


	/**
	 * Groupers: (Interpreting the images from Aaron)
	 *	->Completion - (Incomplete/Complete) Incomplete sorted to the top, then by due date...then by name?
	 *	->Date Due - Grouped by Date (Completion date if present, or by due if not complete?) then sorted by name?
	 *	->Lession - Grouped by where they fall in the content, then sorted by order given by content?
	 *
	 *	->type menu is fixed to 'all' (wildcard, for now)...it will filter the set down. (just like search)
	 *	->search filters down on name only. (for now)
	 *
	 * @param {Object} state
	 */
	getGrouper: function(state) {
		var me = this,
			bar = me.getFilterBar(),
			search = bar && bar.getSearch(),
			groupBy = (state && state.groupBy) || (bar && bar.getGroupBy());

		return function(cmp, store) {
			var count, groups,
				groupPromise;

			store.clearGrouping();
			store.removeFilter('dueFilter');


			if (groupBy) {
				//clear the active stores
				me.activeStores = [];

				//Getting rid of the past due filter until we can better define the behavior
				//if (groupBy === 'due' && !me.showOlder && !search) {
				//	//filter out all of the ones due before today
				//	count = store.getCount();
				//	store.filter([{
				//		id: 'dueFilter',
				//		filterFn: function(rec) {
				//			var now = new Date(),
				//				due = rec.get('due');

				//			return due >= now;
				//		}
				//	}], true);

				//	//if we filtered out any assignments, add a link to see older ones
				//	if (count > store.getCount()) {
				//		console.log('Some assignments were filtered');
				//		//this item has to be the first thing added if its going to be
				//		cmp.add({
				//			xtype: 'box',
				//			cls: 'show-older-container',
				//			renderTpl: Ext.DomHelper.markup([
				//				{cls: 'show-older', html: getString('NextThought.view.courseware.assessment.assignments.View.older')}
				//			]),
				//			listeners: {
				//				'click': {
				//					element: 'el',
				//					fn: function(e) {
				//						if (!e.getTarget('.show-older')) { return; }
				//						me.showOlder = true;
				//						me.refresh();
				//					}
				//				}
				//			}
				//		});
				//	}
				//}

				me.showOlder = false;

				store.group(me.grouperMap[groupBy]);

				groups = [];

				store.getGroups(false).forEach(function(g) {
					//add a group cmp for each group
					var name = g.name,
						proto = g.children[0],
						node = proto.get('outlineNode'),
						store = new Ext.data.Store({fields: me.getFields(), data: g.children, groupName: name}),
						group = Ext.widget(me.newGroupUIConfig({
							store: store
						}));

					function fill(n) {
						store.groupName = n.getTitle();
						group.setTitle(n.get('title'));
						group.setSubTitle(Ext.Date.format(
								node.get('AvailableBeginning') || node.get('AvailableEnding'),
								'F j, Y'
							));
					}


					groups.push(group);

					me.mon(group.down('course-assessment-assignment-list'), 'itemclick', 'onItemClicked');

					me.activeStores.push(store);

					if (groupBy === 'lesson') {
						if (node) { fill(node); }
					} else {
						group.setTitle(name);
					}
				});

				groupPromise = groups.reduce(function(p, v) {
					return p.then(function() {
						return wait(1).then(function() {
							cmp.add(v);
							me.alignNavigation();
						});
					});
				}, wait(1));
			} else {
				groupPromise = Promise.resolve();
			}

			if (state && state.search) {
				this.filterSearchValue(state.search);
			}

			groupPromise
				.then(this.alignNavigation.bind(this));

			return Promise.resolve();
		};
	},


	onItemClicked: function(s, record, dom) {
		var date = Ext.Date.format(record.get('opens'), 'l F j \\a\\t g:i A'),
			item = record && record.get('item'),
			parts = item && item.get('parts');

		if (Ext.fly(dom).hasCls('closed')) {
			alert(getFormattedString('NextThought.view.courseware.assessment.assignments.View.available', { date: date}));
			return;
		}
		this._showAssignment(record);
	},


	getFields: function() {
		return [
			{name: 'lesson', type: 'string'},
			{name: 'outlineNode', type: 'auto'},
			{name: 'id', type: 'string'},
			{name: 'containerId', type: 'string'},
			{name: 'name', type: 'string'},
			{name: 'due', type: 'date'},
			{name: 'opens', type: 'date'},
			{name: 'completed', type: 'date'},
			{name: 'correct', type: 'int'},
			{name: 'maxTime', type: 'int'},
			{name: 'duration', type: 'int'},
			{name: 'history', type: 'auto'},
			{name: 'total', type: 'int'},
			{name: 'item', type: 'auto'},
			{name: 'submittedCount', type: 'int'},
			{name: 'enrolledCount', type: 'int'},
			{name: 'pendingAssessment', type: 'int'},
			{name: 'reportLinks', type: 'auto'}
		];
	},


	initComponent: function() {
		this.subviewBackingStores = [];
		this.callParent(arguments);
		this.enableBubble(['show-assignment', 'update-assignment-view', 'close-reader']);

		this.PathActions = NextThought.app.navigation.path.Actions.create();

		this.on('filters-changed', this.updateFilters.bind(this));
		this.on('search-changed', 'filterSearchValue');

		this.store = new Ext.data.Store({
			fields: this.getFields(),
			sorters: [
				{ property: 'due', direction: 'DESC' },
				{ property: 'name', direction: 'ASC' }
			]
		});
	},


	getFilterBar: function() {
		if (!this.filterBar) {
			this.filterBar = this.down('course-assessment-assignments-filterbar');
		}
		return this.filterBar;
	},


	getContent: function() {
		if (!this.contentCmp) {
			this.contentCmp = this.down('container[rel=content]');
		}
		return this.contentCmp;
	},


	updateFilters: function() {
		var bar = this.getFilterBar(),
			groupBy = bar && bar.getGroupBy(),
			search = bar && bar.getSearch();

		if (!bar) { return; }

		bar.enableGroupBy(false);
		this.setState({
			groupBy: groupBy,
			search: search
		})
		.then(function() {
			bar.enableGroupBy(true);
		});
	},


	applyState: function(state) {
		var cmp = this.getContent(),
			store = this.store,
			g = this.getGrouper(state);

		store.removeFilter('open');
		cmp.removeAll(true);

		if (Ext.isFunction(g)) {
			return g.call(this, cmp, store);
		}

		return Promise.resolve();
	},


	filterSearchValue: function(val) {
		val = val || '';

		(this.activeStores || []).forEach(function(store) {
			//if we are grouped by lessons we will have an ntiid here
			var name = store.groupName.split('|').last;

			name = name.toLowerCase();
			val = val.toLowerCase();

			store.removeFilter('searchFilter');
			//if the group name doesn't contain the search key
			//filter all of the assignments whose title doesn't contain it
			if (name.indexOf(val) < 0) {
				store.addFilter([{
					id: 'searchFilter',
					filterFn: function(rec) {
						var name = rec.get('name');

						name = name.toLowerCase();
						val = val.toLowerCase();

						//if the name doesn't contain the search key
						return name.indexOf(val) >= 0;
					}
				}], true);
			}
		});
	},


	clearAssignmentsData: function() {
		var cmp = this.getContent();
		if (cmp) {
			cmp.removeAll(true);
		}
		Ext.destroy(this.subviewBackingStores);
		this.subviewBackingStores.splice(0);//truncate
	},


	/**
	 * Apply an assignment collection and a bundle
	 *
	 * if we already have the same instance don't do anything
	 *
	 * @param {AssignmentCollection} assignments    the assignment collection
	 * @param {Bundle} instance    the bundle we are in
	 */
	setAssignmentsData: function(assignments, instance, silent) {
		var me = this;


		if (me.data && me.data.instance === instance && silent) {
			return Promise.resolve();
		}

		me.clearAssignmentsData();

		if (!assignments) {
			console.error('No assignments??');
			return Promise.reject('No data');
		}

		me.data = {
			assignments: assignments,
			instance: instance
		};

		function finish(outline) {
			me.data.outline = outline;
			//Becasue this view has special derived fields, we must just listen for changes on the
			// assignments collection itself and trigger a refresh. This cannot simply be a store
			// of HistoryItems.
			return me.applyAssignmentsData();
		}

		return instance.getOutline()
				.done(finish)
				.fail(function(reason) {
					console.error('Failed to get course outline!', reason);
				});
	},


	applyAssignmentsData: function(silent) {
		var me = this,
			lesson, raw = [], waitsOn = [],
			bundle = me.data.instance,
			outline = me.data.outline,
			assignments = me.data.assignments;

		function collect(assignment) {
			if (assignment.doNotShow()) { return; }

			var id = assignment.getId();

			waitsOn.push(Promise.all([
				assignments.getHistoryItem(id, true).fail(function() { return; }),
				assignments.getGradeBookEntry(id),
				ContentUtils.getLineage(id, bundle)
					.then(function(lineages) {
						var lineage = lineages[0];

						return Promise.all(lineage.map(function(ntiid) {
							return outline.findOutlineNode(ntiid);
						})).then(function(results) {
							results = results.filter(function(x) { return !!x; });

							return results[0];
						});
					})
			])
				.then(function(results) {
					var history = results[0],//history item
						grade = results[1],//gradebook entry
						node = results[2];//outline node

					return {
						id: id,
						containerId: assignment.get('containerId'),
						lesson: node && node.getTitle(),
						outlineNode: node,
						item: assignment,
						name: assignment.get('title'),
						opens: assignment.get('availableBeginning'),
						due: assignment.get('availableEnding'),
						maxTime: assignment.isTimed && assignment.getMaxTime(),
						duration: assignment.isTimed && assignment.getDuration(),

						completed: history && history.get('completed'),
						correct: history && history.get('correct'),

						history: history,

						total: assignment.tallyParts(),
						submittedCount: assignment.get('SubmittedCount') | 0,
						enrolledCount: bundle.get('TotalEnrolledCount'),
						reportLinks: assignment.getReportLinks()
					};
				}));
		}

		assignments.each(collect);

		return Promise.all(waitsOn)
			.then(me.store.loadRawData.bind(me.store))
			.then(me.restoreState.bind(me));
	},


	newGroupUIConfig: function(grouper) {
		return {
			xtype: 'grouping',
			dataPromise: grouper.dataPromise,
			title: grouper.title, subTitle: grouper.subTitle,
			items: this.newAssignmentList(grouper)
		};
	},


	newAssignmentList: function(grouper) {
		return { xtype: 'course-assessment-assignment-list', store: grouper.store };
	},


	applyPagerFilter: function() {
		var now = new Date();
		this.store.filter({
			id: 'open',
			filterFn: function(rec) {
				var d = rec.get('opens');
				return (!d || d < now); //ensure the assignment is open.
			}
		});
	},


	restoreState: function() {
		var state = this.getCurrentState(),
			bar = this.getFilterBar();

		if (state && state.groupBy) {
			bar.selectGroupBy(state.groupBy);
		}

		return this.applyState(state);
	},



	showAssignment: function(assignment) {
		var id = assignment && ((assignment.getId && assignment.getId()) || assignment),
			x = this.store.getById(id);

		if (!x) {
			console.warn('Assignment not found:', id);
			return;
		}

		return this._showAssignment(x);
	},


	_showAssignment: function(record) {
		var item = record.get('item');

		if (item) {
			this.navigateToObject(item);
		} else {
			console.error('No Assignment to navigate to');
		}
	}
});
