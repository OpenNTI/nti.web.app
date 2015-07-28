Ext.define('NextThought.app.chat.components.gutter.Tab', {
	extend: 'Ext.Component',

	cls: 'chat-notifications-icon',

	afterRender: function() {
		this.callParent(arguments),

		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
		this.ChatActions = NextThought.app.chat.Actions.create();
		this.mon(this.el, {
			click: this.toggleChatGutter.bind(this)
		});
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
				}
				else {
					me.removeCls('gutter-showing');
				}
			});
	}
});
