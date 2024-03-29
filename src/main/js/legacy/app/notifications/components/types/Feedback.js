const Ext = require('@nti/extjs');

require('./Base');

module.exports = exports = Ext.define(
	'NextThought.app.notifications.components.types.Feedback',
	{
		extend: 'NextThought.app.notifications.components.types.Base',
		alias: 'widget.notification-item-feedback',

		statics: {
			mimeType:
				'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedback',
		},

		itemCls: 'feedback',
		wording: 'posted feedback on {assignment:htmlEncode}',

		fillInWording: function () {
			var me = this,
				assignmentId = me.record.get('AssignmentId');

			Service.getObject(assignmentId).then(function (assignment) {
				var wording = me.wording.replace(
					'{assignment:htmlEncode}',
					me.titleTpl.apply({ name: assignment.get('title') })
				);

				if (me.wordingEl && me.wordingEl.dom) {
					me.wordingEl.dom.innerHTML = wording;
				}
			});
		},
	}
);
