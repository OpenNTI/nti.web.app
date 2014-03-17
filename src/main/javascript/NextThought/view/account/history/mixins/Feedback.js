Ext.define('NextThought.view.account.history.mixins.Feedback', {
	extend: 'NextThought.view.account.history.mixins.Note',
	keyVal: 'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedback',
	alias: 'widget.history-item-feedback',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{
			cls: 'history grade {assignmentName:boolStr("","x-hidden")}',
			cn: [
				{cls: 'body', cn: [
					'Feedback received {assignmentName:boolStr("for ")}',
					{tag: 'span', cls: 'link', html: '{assignmentName}'}
				]}
			]
		}
	])),

	clicked: function(view, rec) {
		var course = CourseWareUtils.courseForNtiid(rec.get('assignmentContainer'));

		CourseWareUtils.findCourseBy(course.findByMyCourseInstance())
			.then(function(instance) {
				instance = instance.get('CourseInstance') || instance;
				return instance.fireNavigationEvent(view);
			})
			.done(function() {
				view.fireEvent('navigate-to-assignment', rec.get('AssignmentId'));
			})
			.fail(function(reason) {
				console.error(reason);
			});
	},

	fillInData: function(rec) {
		if (rec.get('assignmentName')) {
			return;
		}
		Service.getObject(rec.get('AssignmentId'), function(assignment) {
			rec.set('assignmentContainer', assignment.get('ContainerId'));
			rec.set('assignmentName', assignment.get('title'));
		});
	}

});
