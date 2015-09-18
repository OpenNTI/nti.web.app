Ext.define('NextThought.app.notifications.components.types.Grade', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notification-item-grade',

	statics: {
		keyVal: 'application/vnd.nextthought.grade'
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
				me.wordingEl.dom.innerHTML = me.wording.replace('{assignment}', me.titleTpl.apply({name: assignment.get('title')}));
			});
	}
});

// Ext.define('NextThought.app.notifications.components.types.Grade', {
// 	extend: 'NextThought.app.notifications.components.types.Feedback',
// 	keyVal: 'application/vnd.nextthought.grade',
// 	alias: 'widget.notification-item-grade',

// 	showCreator: false,
// 	wording: 'grade reci,
// 	quotePreview: false,
// 	itemCls: 'grade',

// 	getWording: function(values) {
// 		var wording = this.callParent(arguments);

// 		return this.getDisplayNameTpl(values) + wording;
// 	},

// 	getDisplayName: function(values) {
// 		if (!values || !values.course) { return ''; }
// 		return values.course.get('Title');
// 	},


// 	getIcon: function(values) {
// 		return Ext.DomHelper.markup({cls: 'icon'});
// 	}
// });
