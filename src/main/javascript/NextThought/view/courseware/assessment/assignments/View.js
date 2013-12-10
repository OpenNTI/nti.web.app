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


	clearAssignmentsData: function() {
		var cmp = this.getContent();
		if (cmp) {
			cmp.removeAll(true);
		}
		Ext.destroy(this.subviewBackingStores);
		this.subviewBackingStores.splice(0);//truncate
	},


	setAssignmentsDataRaw: function(data) {
		var ntiid;

		this.clearAssignmentsData();

		if (!data) {
			console.error('No data??');
			return;
		}

		delete data.href;//all other keys are container ids...so, lets just drop it.

		for (ntiid in data) {
			if (data.hasOwnProperty(ntiid)) {
				if (ParseUtils.isNTIID(ntiid)) {
					console.warn('[W] Ignoring:', ntiid);
					continue;
				}

				console.debug(data[ntiid]);

			}
		}
	},


	newGroupUIConfig: function(grouper) {
		return {xtype: 'course-assessment-assignment-group',
			title: grouper.getTitle(), subTitle: grouper.getSubTitle(),
			items: this.newAssignmentList(grouper)
		};
	},


	newAssignmentList: function(grouper) {
		return { xtype: 'course-assessment-assignment-list', store: grouper.getStore() };
	}
});
