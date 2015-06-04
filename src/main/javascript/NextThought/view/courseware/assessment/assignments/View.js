/*globals getFormattedString:false*/
Ext.define('NextThought.view.courseware.assessment.assignments.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-assignments',
	requires: [
		'NextThought.ux.Grouping',
		'NextThought.view.courseware.assessment.assignments.FilterBar',
		'NextThought.view.courseware.assessment.assignments.List'
	],
	handlesAssignment: true,
	layout: 'auto',
	cls: 'course-assessment-assignments',
	items: [
		{xtype: 'course-assessment-assignments-filterbar'},
		{xtype: 'container', rel: 'content', cls: 'scrollzone scrollable'}
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
	 */
	getGrouper: function() {
		var me = this,
			bar = me.getFilterBar(),
			//showType = bar.getShowType(),
			groupBy = bar && bar.getGroupBy(),
			search = bar && bar.getSearch();

		//be defensive
		if (!bar) {
			return function() {};
		}
		//return function that will perform the grouping
		return function(cmp, store) {
			var count, groups;
			store.clearGrouping();
			store.removeFilter('dueFilter');
			//TODO: handle the show type

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
					var name = g.name.split('|').last(),
						store = new Ext.data.Store({fields: me.getFields(), data: g.children, groupName: name}),
						group = Ext.widget(me.newGroupUIConfig({
							store: store
						}));

					groups.push(group);

					function fill(node) {
						store.groupName = node.get('title');
						group.setTitle(node.get('title'));
						group.setSubTitle(Ext.Date.format(
								node.get('AvailableBeginning') || node.get('AvailableEnding'),
								'F j, Y'
						));
					}

					function drop() {}

					function resolve(o) { o.findNode(name).done(fill).fail(drop); }

					me.mon(group.down('dataview'), 'itemclick', 'onItemClicked');


					me.activeStores.push(store);

					if (groupBy === 'lesson') {
						group.setTitle('');//lets never show the NTIID
						resolve(me.data.outline);
					} else {
						group.setTitle(name);
					}
				});

				groups.reduce(function(p, v) {
					return p.then(function() {
						return wait(100).then(function() {
							cmp.add(v); return wait(1);});
					});
				}, wait(10));
			}

			if (search) {
				this.filterSearchValue(search);
			}
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

		this.on('filters-changed', 'refresh');
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


	refresh: function() {
		var cmp = this.getContent(),
			s = this.store,
			g = this.getGrouper();

		s.removeFilter('open');
		cmp.removeAll(true);

		if (Ext.isFunction(g)) {
			g.call(this, cmp, s);
		}

		this.syncFilterToState();

		//on keyup in search get all the groups, filter each store, in list.js listen for datachange
		//if the store is empty hide its parent, else show its parent
	},


	filterSearchValue: function(val) {
		(this.activeStores || []).forEach(function(store) {
			//if we are grouped by lessons we will have an ntiid here
			var name = store.groupName.split('|').last();

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


	syncFilterToState: function() {
		var bar = this.getFilterBar(),
			group = bar && bar.getGroupBy();

		if (group) {
			this.replaceState({
				group: group
			});
		}
	},


	clearAssignmentsData: function() {
		var cmp = this.getContent();
		if (cmp) {
			cmp.removeAll(true);
		}
		Ext.destroy(this.subviewBackingStores);
		this.subviewBackingStores.splice(0);//truncate
	},


	setAssignmentsData: function(assignments, instance) {
		var me = this;

		me.clearAssignmentsData();

		if (!assignments) {
			console.error('No assignments??');
			return Promise.reject('No data');
		}

		me.data = {
			assigments: assignments,
			instance: instance
		};

		function finish(outline) {
			me.data.outline = outline;
			//Becasue this view has special derived fields, we must just listen for changes on the
			// assignments collection itself and trigger a refresh. This cannot simply be a store
			// of HistoryItems.
			me.applyAssignmentsData();
			//TODO: listen for changes on the assignments object
			me.updateViewerReferences();
		}

		return instance.getOutline()
				.done(finish)
				.fail(function(reason) {
					console.error('Failed to get course outline!', reason);
				});
	},


	applyAssignmentsData: function() {
		var lesson, raw = [], waitsOn = [], d = this.data,
			assignments = d.assigments;

		//given an assignment built the record for the store
		function collect(o) {
			if (o.doNotShow()) { return; }

			var id = o.getId();

			waitsOn.push(Promise.all([
				assignments.getHistoryItem(id, true).fail(function() { return; }),
				assignments.getGradeBookEntry(id)
			])
				.then(function(results) {
					var h = results[0], // history item
						grade = results[1],
						node;

					lesson = ContentUtils.getLineage(o.get('containerId'));//this function is in need to go asynchronous...but i need it here. :(
					lesson.pop(); //discard the root

					//search through the entire lineage to find an outline node for the assignment
					while (!node) {
						//doing this the first time through is alright because
						//it is discarding the leaf page
						lesson.shift();

						//if there are no lessons in the lineage left we can't find a node
						//so don't keep looping 'ZZZ' will be placed at the bottom
						if (lesson.length === 0) {
							node = 'ZZZ';
						} else {
							node = d.outline.getNode(lesson[0]);
						}
					}

					if (node.get) {
						node = node.index;
						node = (node && node.pad && node.pad(3)) || 'ZZZ';
					}

					lesson = node + '|' + lesson.reverse().join('|');

					return {
						id: id,
						containerId: o.get('containerId'),
						lesson: lesson,
						item: o,
						name: o.get('title'),
						opens: o.get('availableBeginning'),
						due: o.get('availableEnding'),
						maxTime: o.isTimed && o.getMaxTime(),
						duration: o.isTimed && o.getDuration(),

						completed: h && h.get('completed'),
						correct: h && h.get('correct'),

						history: h,

						total: o.tallyParts(),
						submittedCount: o.get('SubmittedCount') || 0,
						enrolledCount: d.instance.get('TotalEnrolledCount'),
						reportLinks: o.getReportLinks()
					};
				})
			);
		}

		assignments.each(collect);

		Promise.all(waitsOn)
			.then(this.store.loadRawData.bind(this.store))
			.then(this.refresh.bind(this));
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


	updateViewerReferences: function() {
		this.fireEvent('update-assignment-view', this, this.store);
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


	restoreState: function(state) {
		if (!state) { return; }

		var me = this,
			bar = me.getFilterBar();

		if (state.group) {
			bar.selectGroupBy(state.group);
		}

		if (!state.activeAssignment) {
			me.fireEvent('close-reader');
			return;
		}

		return new Promise(function(fulfill, reject) {

			function showAssignment() {
				var record = me.store.findBy(function(rec) {
					var item = rec.get('item');

					return item && item.getId() === state.activeAssignment;
				});

				if (record >= 0) {
					record = me.store.getAt(record);

					me._showAssignment(record);
				}
				console.log(me);
			}

			if (me.store.getCount() === 0) {
				me.mon(me.store, {
					'datachanged': showAssignment,
					single: true
				});
			} else {
				showAssignment();
			}
		});
	},


	setStateForAssignment: function(student, assignment) {
		this.pushState({
			activeAssignment: assignment && assignment.getId ? assignment.getId() : assignment
		});
	},


	popStateForAssignment: function() {
		this.pushState({
			activeAssignment: null
		});
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
		var path = [
			'Assignments',
			record.get('name')
		], container = this.up('[rootContainerShowAssignment]');

		this.applyPagerFilter();

		if (!container) {
			console.error('No container with rootContainerShowAssignment');
			return;
		}

		return container.rootContainerShowAssignment(this, record.get('item'), record, $AppConfig.userObject, path,
				NextThought.util.PageSource.create({
					store: this.store,
					current: this.store.indexOf(record)
				})
		);
	}
});
