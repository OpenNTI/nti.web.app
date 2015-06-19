Ext.define('NextThought.app.notifications.components.types.Feedback', {
	extend: 'NextThought.app.notifications.components.types.Base',
	keyVal: 'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedback',
	alias: 'widget.notification-item-feedback',

	showCreator: true,
	itemCls: 'feedback',
	wording: 'NextThought.view.account.notifications.types.Feedback.wording',
	previewField: 'assignmentName',


	assignmentNameTpl: Ext.DomHelper.createTemplate({ tag: 'span', cls: 'link', html: '{name}'}).compile(),


	clicked: function(view, rec) {
		//TODO: figure out this navigation
	},


	fillInData: function(rec) {
		this.callParent(arguments);

		if (!rec.fields.getByKey('course')) {
			rec.fields.add(Ext.data.Field.create({name: 'course', type: 'auto'}));
		}
		if (!rec.fields.getByKey('hidden')) {
			rec.fields.add(Ext.data.Field.create({name: 'hidden', type: 'boolean'}));
		}

		if (rec.get('assignmentContainer') || rec.data.hidden) {return;}

		//TODO: figure out what happens here
		Service.getObject(rec.get('AssignmentId'), function(assignment) {
			var cid = assignment.get('ContainerId'),
				course = CourseWareUtils.courseForNtiid(cid);

			if (!course) {
				rec.data.hidden = true;
				console.warn('Hidding: ', rec.data, ' Could not find course for ID: ', cid);
			}

			rec.data.course = course;
			rec.course = course;
			rec.set({
				assignmentContainer: cid,
				assignmentName: assignment.get('title'),
				assignmentDueDate: assignment.getDueDate()
			});
		}, function() {
			rec.data.hidden = true;//secret..shhh
			rec.set('assignmentName', 'Not Found');
			console.warn('Hidding: ', rec.data, ' Could not find Assignment: ', rec.get('AssignmentId'));
		});
	},


	getWording: function(values) {
		if (!values || !values.course || !this.wording) { return ''; }

		var creator = this.getDisplayNameTpl(values),
			assignment = this.assignmentNameTpl.apply({name: values.assignmentName});

		return getFormattedString(this.wording, {
			creator: creator,
			assignment: assignment
		});
	}
});
