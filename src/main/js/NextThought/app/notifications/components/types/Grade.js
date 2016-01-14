Ext.define('NextThought.app.notifications.components.types.Grade', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notification-item-grade',

	statics: {
		mimeType: 'application/vnd.nextthought.grade'
	},

	itemCls: 'grade',
	wording: 'graded {assignment}',

	fillInWording: function() {
		var me = this,
			assignmentId = me.record.get('AssignmentId');

		if (!assignmentId) {
			me.addCls('x-hidden');
			return;
		}

		return Service.getObject(assignmentId)
			.then(function(assignment) {
				if (me.wordingEl && me.wordingEl.dom) {
					me.wordingEl.dom.innerHTML = me.wording.replace('{assignment}', me.titleTpl.apply({name: assignment.get('title')}));
				}
			});
	}
});
