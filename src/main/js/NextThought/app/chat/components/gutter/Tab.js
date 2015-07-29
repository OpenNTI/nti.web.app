Ext.define('NextThought.app.chat.components.gutter.Tab', {
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


	toggleChatGutter: function() {
		this.ChatStore.fireGutterToggle();
		var me = this;

		wait()
			.then(function() {
				var gutterContainer = Ext.getCmp('chat-window'),
					gutterWin = gutterContainer && gutterContainer.gutterWin,
					listWin = gutterContainer.listWin && gutterContainer.listWin;

				if ((gutterWin && gutterWin.isVisible()) || (listWin && listWin.isVisible())) {
					me.addCls('gutter-showing');
					me.unseenMessageCount = 0;
					me.updateChatBadgeCount();
				}
				else {
					me.removeCls('gutter-showing');
				}
			});
	}
});
