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
		var course = rec.course;
		if (!course) {
			alert({title: 'Uh...', msg: 'This isn`t suppossed to happen...'});
			return;
		}

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
		var me = this;
		Service.getObject(rec.get('AssignmentId'), function(assignment) {
			var cid = assignment.get('ContainerId'),
				course = CourseWareUtils.courseForNtiid(cid);
			if (!course) {
				me.itemCls += ' x-hidden';
			}
			rec.course = course;
			rec.set({
				assignmentContainer: cid,
				assignmentName: assignment.get('title')
			});
		}, function() {
			rec.data.hidden = true;//secret..shhh
			rec.set('assignmentName', 'Not Found');
		});
	}

});
