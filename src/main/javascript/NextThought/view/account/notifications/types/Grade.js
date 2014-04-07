Ext.define('NextThought.view.account.notifications.types.Grade', {
	extend: 'NextThought.view.account.notifications.types.Feedback',
	keyVal: 'application/vnd.nextthought.grade',
	alias: 'widget.notification-item-grade',

	showCreator: false,
	verb: 'Grade received for ',
	quotePreview: false,
	itemCls: 'grade',


	getDisplayName: function(values) {
		if (!values || !this.course) { return ''; }
		return this.course.get('Title');
	}
});
