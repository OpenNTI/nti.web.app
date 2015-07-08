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
			dataBadge: this.currentCount || 0
		});

		this.unreadMessageIds = [];
	},


	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.avatar, 'click', this.showChat.bind(this));
	},


	showChat: function(e) {
		this.openChatWindow(this.user, this, e);
	},


	setStatus: function(presence) {
		var currentStatus = this.presence && this.presence.dom.classList[1];

		if(presence && currentStatus){
			this.presence.toggleCls(currentStatus);
			this.presence.toggleCls(presence.getName());
		}
	},


	updateBadgeCount: function(count) {
		this.currentCount = count;
		if(this.rendered) {
			this.avatar.dom.setAttribute('data-badge', count);
		}
	},


	clearUnreadCount: function() {
		this.unreadMessageIds = [];
		this.updateBadgeCount(0);
	},


	handleWindowNotify: function(win, msg) {
		if (!win || win.isVisible() || isMe(msg.Creator)) {
			return;
		}

		// Check if we don't have this message yet
		var skip = false, i, count;
		msg = msg && msg.isModel ? msg : ParseUtils.parseItems(msg)[0];
		for (i = 0; i < this.unreadMessageIds.length; i++) {
			if(this.unreadMessageIds[i] === msg.getId()) {
				skip = true;
			}
		}

		if (!skip) {
			this.unreadMessageIds.push(msg.getId());
			count = this.unreadMessageIds.length;
			this.updateBadgeCount(count);
		}
	}
});
