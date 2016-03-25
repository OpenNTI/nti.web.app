var Ext = require('extjs');
var ParseUtils = require('../../../../util/Parsing');
var {isMe} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.chat.components.gutter.GutterEntry', {
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
			presence: '',
			dataBadge: this.user.get('unreadMessageCount') || 0
		});

		this.unreadMessageIds = [];
	},


	afterRender: function () {
		this.callParent(arguments);
		this.setStatus(this.user && this.user.getPresence());
		this.mon(this.avatar, 'click', this.showChat.bind(this));
	},


	showChat: function (e) {
		this.openChatWindow(this.user, this, e);
	},


	setStatus: function (presence) {
		var currentStatus = this.presence && this.presence.dom.classList[1],
			currentActiveStatus = this.avatar && this.avatar.dom.classList[1];

		if (!presence) { return; }

		this.presence.toggleCls(currentStatus || '');
		this.presence.toggleCls(presence.getName());
		this.avatar.toggleCls(currentActiveStatus || '');
		this.avatar.addCls(presence.getName());
	},


	updateBadgeCount: function (count) {
		// Keep the unread message count on the record,
		// that way if we redraw the entry it will still be there.
		this.user.set('unreadMessageCount', count);
		if(this.rendered) {
			this.avatar.dom.setAttribute('data-badge', count);
		}
	},


	clearUnreadCount: function () {
		this.unreadMessageIds = [];
		this.user.set('unreadMessageCount', 0);
		this.updateBadgeCount(0);
	},


	handleWindowNotify: function (win, msg) {
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
