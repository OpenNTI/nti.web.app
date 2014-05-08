Ext.define('NextThought.view.account.notifications.types.Feedback', {
	extend: 'NextThought.view.account.notifications.types.Base',
	keyVal: 'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedback',
	alias: 'widget.notification-item-feedback',

	showCreator: true,
	itemCls: 'feedback',
	wording: 'NextThought.view.account.notifications.types.Feedback.wording',
	previewField: 'assignmentName',


	assignmentNameTpl: Ext.DomHelper.createTemplate({ tag: 'span', cls: 'link', html: '{name}'}).compile(),


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
		this.callParent(arguments);
		var me = this;

		if (rec.get('assignmentContainer') || rec.data.hidden) {return;}

		Service.getObject(rec.get('AssignmentId'), function(assignment) {
			var cid = assignment.get('ContainerId'),
					course = CourseWareUtils.courseForNtiid(cid);
			if (!course) {
				me.itemCls += ' x-hidden';
			}
			me.course = course;
			rec.course = course;
			rec.set({
				assignmentContainer: cid,
				assignmentName: assignment.get('title'),
				assignmentDueDate: assignment.getDueDate()
			});
		}, function() {
			rec.data.hidden = true;//secret..shhh
			rec.set('assignmentName', 'Not Found');
		});
	},


	getWording: function(values) {
		if (!values || !this.course || !this.wording) { return ''; }

		var creator = this.getDisplayNameTpl(values),
			assignment = this.assignmentNameTpl.apply({name: values.assignmentName});

		return getFormattedString(this.wording, {
			creator: creator,
			assignment: assignment
		});
	}
});
