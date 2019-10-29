const Ext = require('@nti/extjs');
const classnames = require('classnames/bind');

const ChatActions = require('legacy/app/chat/Actions');
const ChatStateStore = require('legacy/app/chat/StateStore');
const NavigationStateStore = require('legacy/app/navigation/StateStore');

const Styles = require('./Tab.css');
const cx = classnames.bind(Styles);

const lightCls = cx('light');
const darkCls = cx('dark');

module.exports = exports = Ext.define('NextThought.app.chat.components.gutter.Tab', {
	extend: 'Ext.Component',


	renderTpl: Ext.DomHelper.markup([
		{cls: cx('chat-notifications-icon', 'icon'), role: 'button', tabindex: '0', 'aria-label': 'Chat Notifications'}
	]),

	setTheme (theme) {
		if (theme === 'light') {
			this.addCls(lightCls);
			this.removeCls(darkCls);
		} else if (theme === 'dark') {
			this.removeCls(lightCls);
			this.addCls(darkCls);
		} else {
			this.removeCls(lightCls);
			this.removeCls(darkCls);
		}
	},

	afterRender: function () {
		this.callParent(arguments),

		this.ChatStore = ChatStateStore.getInstance();
		this.ChatActions = ChatActions.create();
		this.NavigationStore = NavigationStateStore.getInstance();

		this.mon(this.el, {
			click: this.toggleChatGutter.bind(this)
		});

		this.mon(this.NavigationStore, 'chat-notify-tab', this.handleChatNotification.bind(this));
		this.mon(this.NavigationStore, 'clear-chat-tab', this.clearMessagesForUser.bind(this));

		this.mon(this.ChatStore, {
			'gutter-deactive': this.onGutterDeactive.bind(this),
			'gutter-active': this.onGutterActive.bind(this)
		});

		this.unseenMessageCount = 0;
		this.unreadMessages = [];
	},


	handleChatNotification: function (msg) {
		if (!this.hasCls('gutter-showing')) {
			this.unreadMessages.push(msg);
			this.updateChatBadgeCount();

		}
	},


	updateChatBadgeCount: function () {
		if (this.rendered) {
			this.el.set({'data-badge': this.unreadMessages.length});
		}
	},


	clearMessagesForUser: function (user) {
		var toRemove = [],
			username = user.isModel ? user.get('Username') : user;

		Ext.each(this.unreadMessages, function (msg) {
			if (msg.Creator === username) {
				toRemove.push(msg);
			}
		});

		if (toRemove.length > 0) {
			this.unreadMessages = Ext.Array.difference(this.unreadMessages, toRemove);
		}

		this.updateChatBadgeCount();
	},


	onGutterDeactive: function () {
		this.removeCls('gutter-showing');
	},


	onGutterActive: function () {
		this.addCls('gutter-showing');
	},


	toggleChatGutter: function () {
		this.ChatStore.fireGutterToggle();
	}
});
