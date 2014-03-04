Ext.define('NextThought.view.courseware.assessment.assignments.admin.FilterMenu', {
	extend: 'Ext.menu.Menu',
	alias: [
		'widget.course-assessment-admin-assignments-item-filter',
		'widget.test-filter'
	],

	requires: [
		'NextThought.view.menus.SearchItem'
	],

	ui: 'nt',
	plain: true,
	showSeparator: false,
	shadow: false,
	frame: false,
	cls: 'no-checkboxes no-footer student-filter-search',
	hideMode: 'display',
	autoHide: false,


	defaults: {
		ui: 'nt',
		xtype: 'menucheckitem',
		group: 'student-filter',
		plain: true
		//cls: '',
	},


	items: [
		{ xtype: 'label', text: 'Display' },
		{ text: 'Enrolled Students', checked: true},
		{ text: 'Open Students'},
		{
			xtype: 'search-menu-item',
			placeholder: 'Search Students'
		}
	]
});
