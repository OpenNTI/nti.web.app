Ext.define('NextThought.view.courseware.assessment.assignments.FilterBar', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-assignments-filterbar',
	ui: 'course-assessment',
	cls: 'assignment-filterbar',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'third dropmenu', cn: [
			{ cls: 'label', html: 'All Assignments' }
		] },
		{ cls: 'third dropmenu', cn: [
			{ cls: 'label', html: 'By Lesson' }
		] },
		{ cls: 'third search', cn: [
			{ tag: 'input', type: 'text', placeholder: 'Search Assignments', required: 'required' },
			{ cls: 'clear' }
		] }
	]),



	getShowType: function() {

	},


	getGroupBy: function() {

	},


	getSearch: function() {

	}
});
