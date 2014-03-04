Ext.define('NextThought.view.courseware.assessment.assignments.admin.FilterMenuItem', {
	extend: 'Ext.menu.CheckItem',
	alias: 'widget.student-admin-filter-menu-item',

	childEls: ['countEl'],

	cls: 'filter-menu-item-with-count',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'count', id: '{id}-countEl' },
		'{text}'
	])
});
