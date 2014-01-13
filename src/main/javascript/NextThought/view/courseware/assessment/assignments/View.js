Ext.define('NextThought.view.courseware.assessment.assignments.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-assignments',
	requires: [
		'NextThought.view.courseware.assessment.assignments.FilterBar',
		'NextThought.view.courseware.assessment.assignments.Grouping',
		'NextThought.view.courseware.assessment.assignments.List'
	],
	handlesAssignment: true,
	layout: 'auto',
	cls: 'course-assessment-assignments',
	items: [
		{xtype: 'course-assessment-assignments-filterbar'},
		{xtype: 'container', rel: 'content', cls: 'scrollzone scrollable'}
			/* Exmaple items:
				{xtype: 'course-assessment-assignment-group', title: '1. About Geology', subTitle: 'August 19', items: [
					{ xtype: 'course-assessment-assignment-list' }
				]}
			*/
	],


	grouperMap: {
		'lesson': 'lesson',
		'completion': {
			'property': 'completed',
			'getGroupString': function(val) {
				return val.get('completed') ? 'Completed' : 'Incomplete';
			}
		},
		'due': {
			'property': 'due',
			'getGroupString': function(val) {
				var today = (new Date()).setHours(0, 0, 0),
					due = val.get('due'),
					day = (new Date(due.getTime())).setHours(0, 0, 0);

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
	 * 	-> Completion - (Incomplete/Complete) Incomplete sorted to the top, then by due date...then by name?
	 * 	-> Date Due - Grouped by Date (Completion date if present, or by due if not complete?) then sorted by name?
	 * 	-> Lession - Grouped by where they fall in the content, then sorted by order given by content?
	 *
	 * 	-> type menu is fixed to 'all' (wildcard, for now)...it will filter the set down. (just like search)
	 * 	-> search filters down on name only. (for now)
	 */
	getGrouper: function() {
		var me = this,
			bar = me.getFilterBar(),
			//showType = bar.getShowType(),
			groupBy = bar.getGroupBy(),
			search = bar.getSearch();

		//return function that will perform the grouping
		return function(cmp, store) {
			var count;

			store.removeFilter('dueFilter');
			//TODO: handle the show type

			if (groupBy) {
				//clear the active stores
				me.activeStores = [];

				if (groupBy === 'due' && !me.showOlder && !search) {
					//filter out all of the ones due before today
					count = store.getCount();
					store.filter([{
						id: 'dueFilter',
						filterFn: function(rec) {
							var now = new Date(),
								due = rec.get('due');

							return due >= now;
						}
					}], true);

					//if we filtered out any assignments, add a link to see older ones
					if (count > store.getCount()) {
						console.log('Some assignments were filtered');
						//this item has to be the first thing added if its going to be
						cmp.add({
							xtype: 'box',
							cls: 'show-older-container',
							renderTpl: Ext.DomHelper.markup([
								{cls: 'show-older', html: 'Show Previous Dates'}
							]),
							listeners: {
								'click': {
									element: 'el',
									fn: function(e) {
										if (!e.getTarget('.show-older')) { return; }
										me.showOlder = true;
										me.refresh();
									}
								}
							}
						});
					}
				}

				me.showOlder = false;

				store.clearGrouping();
				store.group(me.grouperMap[groupBy]);

				store.getGroups(false).forEach(function(g) {
					//add a group cmp for each group
					var name = g.name.split('|').last(),
						store = new Ext.data.Store({fields: me.getFields(), data: g.children, groupName: name}),
						group = cmp.add(me.newGroupUIConfig({
							store: store
						}));

					function fill(node) {
						store.groupName = node.get('title');
						group.setTitle(node.get('title'));
						group.setSubTitle(Ext.Date.format(
								node.get('AvailableBeginning') || node.get('AvailableEnding'),
								'F j, Y'
						));
					}

					function drop() { Ext.destroy(group); }

					function resolve(o) { o.findNode(name).done(fill).fail(drop); }

					group.setTitle(name);
					me.mon(group.down('dataview'), 'itemclick', 'onItemClicked');


					me.activeStores.push(store);

					if (groupBy === 'lesson') {
						me.data.instance.getOutline().done(resolve).fail(drop);
					}
				});
			}

			if (search) {
				this.filterSearchValue(search);
			}
		};
	},


	onItemClicked: function(s, record, dom) {
		if (Ext.fly(dom).hasCls('closed')) {
			return;
		}
		this.goToAssignment(record);
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
			{name: 'total', type: 'int'},
			{name: 'item', type: 'auto'},
			{name: 'submittedCount', type: 'int'},
			{name: 'enrolledCount', type: 'int'}
		];
	},


	initComponent: function() {
		this.subviewBackingStores = [];
		this.callParent(arguments);
		this.enableBubble(['show-assignment', 'update-assignment-view']);

		this.on('filters-changed', 'refresh');
		this.on('search-changed', 'filterSearchValue');

		this.store = new Ext.data.Store({ fields: this.getFields() });
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

		cmp.removeAll(true);

		if (Ext.isFunction(g)) {
			g.call(this, cmp, s);
		}

		//on keyup in search get all the groups, filter each store, in list.js listen for datachange
		//if the store is empty hide its parent, else show its parent
	},


	filterSearchValue: function(val) {
		this.activeStores.forEach(function(store) {
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


	clearAssignmentsData: function() {
		var cmp = this.getContent();
		if (cmp) {
			cmp.removeAll(true);
		}
		Ext.destroy(this.subviewBackingStores);
		this.subviewBackingStores.splice(0);//truncate
	},


	setAssignmentsData: function(assignments, history, instance) {
		this.clearAssignmentsData();

		if (!assignments) {
			console.error('No assignments??');
			return;
		}

		this.data = {
			assigments: assignments,
			history: history,
			instance: instance
		};

		//Becasue this view has special derived fields, we must just listen for changes on the
		// assignments collection itself and trigger a refresh. This cannot simply be a store
		// of HistoryItems.
		this.applyAssignmentsData();

		//TODO: listen for changes on the assignments object

		this.updateViewerReferences();
	},


	applyAssignmentsData: function() {
		var lesson, raw = [], d = this.data,
			history = d.history,
			assignments = d.assigments;

		function collect(o) {
			if (o.doNotShow()) { return; }
			var id = o.getId(),
				h = history && history.getItem(id);

			lesson = ContentUtils.getLineage(o.get('containerId'));//this function is in need to go asynchronous...but i need it here. :(
			lesson.pop();//discard the root
			if (lesson.length > 1) {
				lesson.shift();//discard leaf page
			}
			lesson.reverse().join('|');

			raw.push({
				id: id,
				containerId: o.get('containerId'),
				lesson: lesson,
				item: o,
				name: o.get('title'),
				opens: o.get('availableBeginning'),
				due: o.get('availableEnding'),

				completed: h && h.get('completed'),
				correct: h && h.get('correct'),

				total: o.tallyParts(),
				submittedCount: o.get('SubmittedCount') || 0,
				enrolledCount: assignments.getRoster().length || 0
			});
		}

		assignments.each(collect);
		this.store.loadRawData(raw);
		this.refresh();

		this.mon(assignments, 'Roster-changed', 'updateEnrolledCount');
	},


	updateEnrolledCount: function(v) {
		var c = (v && v.length) || 0;
		this.store.each(function(r) {
			r.set('enrolledCount', c);
		});
	},


	newGroupUIConfig: function(grouper) {
		return {xtype: 'course-assessment-assignment-group',
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


	goToAssignment: function(record) {
		var path = [
			'Assignments',
			record.get('name')
		];

		this.fireEvent('show-assignment', this, record.get('item'), record, $AppConfig.userObject, path, this.store, this.store.indexOf(record) + 1);
	},


	showAssignment: function(assignment) {
		var id = assignment && ((assignment.getId && assignment.getId()) || assignment),
			x = this.store.getById(id);

		if (!x) {
			console.warn('Assignment not found:', id);
			return;
		}

		this.goToAssignment(x);
	}
});
