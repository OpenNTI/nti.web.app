export default Ext.define('NextThought.app.notifications.components.types.Feedback', {
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
