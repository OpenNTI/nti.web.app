Ext.define('NextThought.view.account.history.mixins.Grade', {
	extend: 'NextThought.view.account.history.mixins.Base',
	keyVal: 'application/vnd.nextthought.grade',
	alias: 'widget.history-item-grade',

	showCreator: false,
	verb: 'Grade recieved for',
	quotePreview: false,
	previewField: 'assignmentName',
	itemCls: 'grade',

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
