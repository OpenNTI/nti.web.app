export default Ext.define('NextThought.app.chat.components.gutter.Tab', {
	extend: 'Ext.Component',

	cls: 'chat-notifications-icon',

	afterRender: function() {
		this.callParent(arguments),

		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
		this.ChatActions = NextThought.app.chat.Actions.create();
		this.NavigationStore = NextThought.app.navigation.StateStore.getInstance();

		this.mon(this.el, {
			click: this.toggleChatGutter.bind(this)
		});

		this.mon(this.NavigationStore, 'chat-notify-tab', this.handleChatNotification.bind(this));

		this.mon(this.ChatStore, {
			'gutter-deactive': this.onGutterDeactive.bind(this),
			'gutter-active': this.onGutterActive.bind(this)
		});

		this.unseenMessageCount = 0;
	},


	handleChatNotification: function(msg) {
		if (!this.hasCls('gutter-showing')) {
			this.unseenMessageCount += 1;
			this.updateChatBadgeCount();
		}
	},


	updateChatBadgeCount: function() {
		if (this.rendered) {
			this.el.set({'data-badge': this.unseenMessageCount});
		}
	},


	onGutterDeactive: function() {
		this.removeCls('gutter-showing');
	},


	onGutterActive: function() {
		this.addCls('gutter-showing');
	},


	toggleChatGutter: function() {
		this.ChatStore.fireGutterToggle();
	}
});
