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
		{xtype: 'container', cls: 'scrollzone scrollable', items: [
			{xtype: 'course-assessment-assignment-group', title: '1. About Geology', subTitle: 'August 19', items: [
				{ xtype: 'course-assessment-assignment-list' }
			]}
		]}
	],


	clearAssignmentsData: function() {},


	setAssignmentsDataRaw: function(data) {
		var ntiid;
		if (!data) {
			console.error('No data??');
			return;
		}
		delete data.href;

		for (ntiid in data) {
			if (data.hasOwnProperty(ntiid)) {
				console.debug(data[ntiid]);
			}
		}
	}
});
