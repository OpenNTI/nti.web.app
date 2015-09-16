Ext.define('NextThought.app.notifications.components.types.Grade', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notification-item-grade',

	itemCls: 'grade',
	wording: 'grade recieved for {assignment}',

	fillInWording: function() {
		this.wordingEl.dom.innerHTML = this.wording;
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
