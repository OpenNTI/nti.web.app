Ext.define('NextThought.app.notifications.components.types.Grade', {
	extend: 'NextThought.app.notifications.components.types.Feedback',
	keyVal: 'application/vnd.nextthought.grade',
	alias: 'widget.notification-item-grade',

	showCreator: false,
	wording: 'NextThought.view.account.notifications.types.Grade.wording',
	quotePreview: false,
	itemCls: 'grade',

	getWording: function(values) {
		var wording = this.callParent(arguments);

		return this.getDisplayNameTpl(values) + wording;
	},

	getDisplayName: function(values) {
		if (!values || !values.course) { return ''; }
		return values.course.get('Title');
	}
});
