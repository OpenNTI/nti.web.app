Ext.define('NextThought.view.courseware.assessment.assignments.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-assignments',
	requires: [
		'NextThought.view.courseware.assessment.assignments.FilterBar',
		'NextThought.view.courseware.assessment.assignments.Grouping',
		'NextThought.view.courseware.assessment.assignments.List'
	],
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
			'getGroupString': function(val){
				return val.get('completed')? 'Completed' : 'Incomplete';
			}
		},
		'due': {
			'property': 'due',
			'getGroupString': function(val){
				var now = new Date(),
					due = val.get('due'),
					sameDay = now.getDay() === due.getDay(),
					sameMonth = now.getMonth() === due.getMonth(),
					sameYear = now.getFullYear() === due.getFullYear();

				if(sameDay && sameMonth && sameYear){
					//its due today
					return 'Today'
				}
				return Ext.Date.format(val.get('due'), 'F j, Y')
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
			showType = bar.getShowType(),
			groupBy = bar.getGroupBy(),
			search = bar.getSearch(),
			outline = me.outline;

		//return function that will perform the grouping
		return function(cmp, store){
			var count;

			store.removeFilter('dueFilter');
			//TODO: handle the show type

			if(groupBy){
				//clear the active stores
				me.activeStores = [];

				if(groupBy === 'due' && !me.showOlder && !search){
					//filter out all of the ones due before today
					count = store.getCount()
					store.filter([{
						id: 'dueFilter',
						filterFn: function(rec){
							var now = new Date(),
								due = rec.get('due');

							return due >= now;
						}
					}], true);

					//if we filtered out any assignments, add a link to see older ones
					if(count > store.getCount()){
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
									fn: function(e){
										if(!e.getTarget('.show-older')){ return; }
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

				store.getGroups().forEach(function(g){
					//add a group cmp for each group
					var name = g.name.split('|').last(),
						store =  new Ext.data.Store({fields: me.getFields(), data: g.children, groupName: name}),
						group = cmp.add(me.newGroupUIConfig({
							store: store
						}));
						group.setTitle(name);

					me.activeStores.push(store);

					if(groupBy === 'lesson'){
						outline.findNode(name).done(function(node) {
							store.groupName = node.get('title');
							group.setTitle(node.get('title'));
							group.setSubTitle(Ext.Date.format(
									node.get('AvailableBeginning') || node.get('AvailableEnding'),
									'F j, Y'
							));
						});
					}
				});
			}

			if(search){
				this.filterSearchValue(search);
			}
		}
	},


	getFields: function() {
		return [
			{name: 'lesson', type: 'string'},
			{name: 'id', type: 'string'},
			{name: 'containerId', type: 'string'},
			{name: 'name', type: 'string'},
			{name: 'due', type: 'date'},
			{name: 'completed', type: 'date'},
			{name: 'correct', type: 'int'},
			{name: 'total', type: 'int'}
		];
	},


	initComponent: function() {
		this.subviewBackingStores = [];
		this.callParent(arguments);

		this.on('filters-changed', 'refresh');
		this.on('search-changed', 'filterSearchValue');
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

		if(Ext.isFunction(g)){
			g.call(this, cmp, s);
		}
		


		//on keyup in search get all the groups, filter each store, in list.js listen for datachange
		//if the store is empty hide its parent, else show its parent


	},


	filterSearchValue: function(val){
		var me = this;

		this.activeStores.forEach(function(store){
			//if we are grouped by lessons we will have an ntiid here
			var name = store.groupName.split('|').last();

			name = name.toLowerCase();
			val = val.toLowerCase();

			store.removeFilter('searchFilter');
			//if the group name doesn't contain the search key
			//filter all of the assignments whose title doesn't contain it
			if(name.indexOf(val) < 0){
				store.addFilter([{
					id: 'searchFilter',
					filterFn: function(rec){
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


	setAssignmentsData: function(data, history, outline) {
		var ntiid, lesson, raw = [];

		this.clearAssignmentsData();

		if (!data) {
			console.error('No data??');
			return;
		}

		function collect(o) {
			var id = o.getId(),
				h = history.getItem(id),
				submission = h && h.get('Submission'),
				assessment = h && h.get('pendingAssessment');

			raw.push({
				id: id,
				containerId: o.get('containerId'),
				lesson: lesson,
				item: o,
				history: h,
				name: o.get('title'),
				opens: o.get('availableBeginning'),
				due: o.get('availableEnding'),
				completed: submission && submission.get('CreatedTime'),
				correct: assessment && assessment.getCorrectCount(),
				total: o.tallyParts()
			});
		}

		this.history = history;
		this.outline = outline;

		delete data.href;//all other keys are container ids...so, lets just drop it.

		for (ntiid in data) {
			if (data.hasOwnProperty(ntiid)) {
				if (!ParseUtils.isNTIID(ntiid)) {//just to be safe
					console.warn('[W] Ignoring:', ntiid);
					continue;
				}

				lesson = ContentUtils.getLineage(ntiid);//this function is in need to go asynchronous...but i need it here. :(
				lesson.pop();//discard the root
				if (lesson.length > 1) {
					lesson.shift();//discard leaf page
				}
				lesson.reverse().join('|');

				ParseUtils.parseItems(data[ntiid]).forEach(collect);
			}
		}

		this.store = new Ext.data.Store({
			fields: this.getFields(),
			data: raw
		});

		this.refresh();
	},


	newGroupUIConfig: function(grouper) {
		return {xtype: 'course-assessment-assignment-group',
			dataPromise: grouper.dataPromise,
			title: grouper.title, subTitle: grouper.subTitle,
			items: this.newAssignmentList(grouper)
		};
	},


	newAssignmentList: function(grouper) {
		console.debug('Creating Assignment List with Grouper', grouper);
		return { xtype: 'course-assessment-assignment-list', store: grouper.store };
	}
});
