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
		var bar = this.getFilterBar(),
			showType = bar.getShowType(),
			groupBy = bar.getGroupBy(),
			search = bar.getSearch();

		//return function that will perform the grouping
	},


	getFields: function() {
		return [
			{name: 'lesson', type: 'string'},
			{name: 'id', type: 'int'},
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
	},


	getFilterBar: function() {
		if (!this.filterBar) {
			this.filterBar = this.down('course-course-assessment-assignments-filterbar');
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
		var me = this,
			cmp = me.getContent(),
			s = me.store,
			//g = me.getGrouper(),
			o = [],
			outline = me.outline;

		s.clearGrouping();
		s.group('lesson');

		s.getGroups().forEach(function(g) {

			var name = g.name.split('|').last(),
				group = cmp.add(me.newGroupUIConfig({
					title: name,
					subTitle: '',
					get store() { return new Ext.data.Store({fields: me.getFields(), data: g.children}); },
					set store(value) { throw 'Read Only'; }
				}));

			outline.findNode(name).done(function(node) {
				group.setTitle(node.get('Title'));
				group.setSubTitle(Ext.Date.format(
						node.get('AvailableBeginning'),
						'F j, Y'
				));
			});
		});


		cmp.add(o);
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
		return { xtype: 'course-assessment-assignment-list', store: grouper.store };
	}
});
