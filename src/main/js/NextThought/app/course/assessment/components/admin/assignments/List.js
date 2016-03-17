export default Ext.define('NextThought.app.course.assessment.components.admin.assignments.List', {
	extend: 'NextThought.app.course.assessment.components.student.assignments.List',
	alias: 'widget.course-assessment-assignment-admin-list',

	cls: 'assignment-list admin',

	requires: [
		'NextThought.app.course.assessment.components.admin.assignments.ListItem',
		'NextThought.common.menus.Reports',
		'NextThought.app.course.assessment.AssignmentStatus'
	],

	view: 'admin',

	itemType: 'course-assessment-assignment-admin-list-item',

	items: [
		{xtype: 'box', autoEl: {cls: 'group-header', html: 'Completion'}},
		{xtype: 'container', layout: 'none', itemContainer: true}
	],


	getItemsContainer: function() {
		return this.down('[itemContainer]');
	}
});
