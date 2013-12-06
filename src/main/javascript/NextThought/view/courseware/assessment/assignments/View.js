Ext.define('NextThought.view.courseware.assessment.assignments.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-assignments',
	requires: [
		'NextThought.view.courseware.assessment.assignments.FilterBar'
	],

	items: [
		{xtype: 'course-assessment-assignments-filterbar'}
	]
});
