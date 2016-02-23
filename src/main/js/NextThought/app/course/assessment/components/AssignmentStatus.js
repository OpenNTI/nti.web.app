Ext.define('NextThought.app.course.assessment.components.AssignmentStatus', {
	extend: 'Ext.Component',
	alias: 'widget.course-assignment-status',

	requires: [
		'NextThought.app.course.assessment.AssignmentStatus'
	],


	renderTpl: Ext.DomHelper.markup([
		{cls: 'assignment-status'},
		{cls: 'menu-container'}
	]),


	renderSelectors: {
		statusEl: '.assignment-status',
		menuContainer: '.menu-container'
	},


	afterRender: function() {
		this.callParent(arguments);

		var assignment = this.assignment,
			history = this.history,
			grade = history && history.get && history.get('Grade'),
			status = NextThought.app.course.assessment.AssignmentStatus.getStatusHTML({
				due: assignment.getDueDate(),
				completed: history && history.get('completed'),
				maxTime: assignment.isTimed && assignment.getMaxTime(),
				duration: assignment.isTimed && assignment.getDuration(),
				isExcused: grade && grade.get('IsExcused'),
				isNoSubmitAssignment: assignment.isNoSubmit()
			});

		this.statusEl.dom.innerHTML = status;
	}
});
