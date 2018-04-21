const Ext = require('@nti/extjs');

require('legacy/common/menus/Reports');

require('../../../AssignmentStatus');
require('../../student/assignments/List');
require('./ListItem');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.admin.assignments.List', {
	extend: 'NextThought.app.course.assessment.components.student.assignments.List',
	alias: 'widget.course-assessment-assignment-admin-list',
	cls: 'assignment-list admin',
	view: 'admin',
	itemType: 'course-assessment-assignment-admin-list-item',

	items: [
		{xtype: 'box', autoEl: {cls: 'group-header', html: 'Completion'}},
		{xtype: 'container', layout: 'none', itemContainer: true}
	],

	getItemsContainer: function () {
		return this.down('[itemContainer]');
	}
});
