Ext.define('NextThought.app.notifications.components.types.Feedback', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notification-item-feedback',

	statics: {
		keyVal: 'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedback'
	},

	itemCls: 'feedback',
	wording: 'posted feedback on {assignment}',

	fillInWording: function() {
		var me = this,
			assignmentId = me.record.get('AssignmentId');

		Service.getObject(assignmentId)
			.then(function(assignment) {
				var wording = me.wording.replace('{assignment}', me.titleTpl.apply({name: assignment.get('title')}));

				me.wordingEl.dom.innerHTML = wording;
			});
	}
});

// Ext.define('NextThought.app.notifications.components.types.Feedback', {
// 	extend: 'NextThought.app.notifications.components.types.Base',
// 	keyVal: 'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedback',
// 	alias: 'widget.notification-item-feedback',

// 	showCreator: true,
// 	itemCls: 'feedback',
// 	wording: 'NextThought.view.account.notifications.types.Feedback.wording',
// 	previewField: 'assignmentName',


// 	assignmentNameTpl: Ext.DomHelper.createTemplate({ tag: 'span', cls: 'link', html: '{name}'}).compile(),


// 	clicked: function(view, rec) {
// 		//TODO: figure out this navigation
// 	},


// 	fillInData: function(rec) {
// 		this.callParent(arguments);

// 		var libraryActions = this.LibraryActions,
// 			assignment, cid;

// 		if (!rec.fields.getByKey('course')) {
// 			rec.fields.add(Ext.data.Field.create({name: 'course', type: 'auto'}));
// 		}
// 		if (!rec.fields.getByKey('hidden')) {
// 			rec.fields.add(Ext.data.Field.create({name: 'hidden', type: 'boolean'}));
// 		}

// 		if (rec.get('assignmentContainer') || rec.data.hidden) {return;}

// 		Service.getObject(rec.get('AssignmentId'), function(a) {
// 			assignment = a;

// 			cid = assignment.get('ContainerId');

// 			return libraryActions.findBundleForNTIID(cid);
// 		}, function() {
// 			rec.data.hidden = true;
// 			rec.set('assignmentName', 'Not Found');
// 			console.warn('Hiding', rec.data, ' Could not find Assignment: ', rec.get('AssignmentId'));
// 		}).then(function(course) {
// 			rec.data.course = course;
// 			rec.course = course;

// 			rec.set({
// 				assignmentContainer: cid,
// 				assignmentName: assignment.get('title'),
// 				assignmentDueDate: assignment.getDueDate()
// 			});
// 		});
// 	},


// 	getWording: function(values) {
// 		if (!values || !values.course || !this.wording) { return ''; }

// 		var creator = this.getDisplayNameTpl(values),
// 			assignment = this.assignmentNameTpl.apply({name: values.assignmentName});

// 		return getFormattedString(this.wording, {
// 			creator: creator,
// 			assignment: assignment
// 		});
// 	}
// });
