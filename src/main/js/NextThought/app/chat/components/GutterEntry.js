Ext.define('NextThought.app.chat.components.GutterEntry', {
	extend: 'Ext.Component',
	alias: 'widget.chat-gutter-entry',

	cls: 'presence-gutter-entry',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'profile-pic', 'data-qtip': '{user:displayName}', 'data-badge': '{dataBadge}', cn: [
			'{user:avatar}',
			{cls: 'presence {presence}'}
		]}
	]),


	renderSelectors: {
		avatar: '.profile-pic',
		presence: '.profile-pic .presence'
	},


	initComponent: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			user: this.user,
			presence: this.user && this.user.getPresence().getName(),
			dataBadge: 0
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.avatar, 'click', this.showChat.bind(this));
	},


	showChat: function(e) {
		this.openChatWindow(this.user, e);
	},


	setStatus: function() {},


	setBadgeCount: function() {}
});
