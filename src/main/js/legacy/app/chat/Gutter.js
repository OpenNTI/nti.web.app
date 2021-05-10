const Ext = require('@nti/extjs');
const { SocialFeatures } = require('@nti/web-profiles');

require('internal/legacy/overrides/ReactHarness');

const ChatStateStore = require('./StateStore');

let options = {
	items: [],
	layout: 'none',
};

module.exports = exports = Ext.define('NextThought.app.chat.Gutter', {
	extend: 'Ext.container.Container',
	alias: 'widget.chat-gutter-window',

	...options,

	ENTRY_BOTTOM_OFFSET: 100,

	initComponent: function () {
		this.callParent(arguments);

		this.ChatStore = ChatStateStore.getInstance();

		// this.buildStore();
		this.mon(this.ChatStore, {
			notify: (target, msg) => this.handleWindowNotify(target, msg),
		});

		this.add({
			xtype: 'react',
			component: SocialFeatures.ChatBar,
			addHistory: true,
			baseroute: '/app',
			navigation: false,
		});
	},

	handleWindowNotify: function (win, msg, recalled = 0) {
		if (win?.isVisible()) {
			return;
		}

		const sender = msg.creator;

		SocialFeatures.Store.handleWindowNotify(sender);
	},
});
