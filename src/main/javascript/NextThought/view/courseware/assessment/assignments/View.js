Ext.define('NextThought.view.courseware.assessment.assignments.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-assignments',
	requires: [
		'NextThought.view.courseware.assessment.assignments.FilterBar',
		'NextThought.view.courseware.assessment.assignments.Grouping'
	],

	items: [
		{xtype: 'course-assessment-assignments-filterbar'},
		{xtype: 'course-assessment-assignment-group', title: '1. About Geology', subTitle: 'August 19'}
	]
});
