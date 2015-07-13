Ext.define('NextThought.app.chat.components.gutter.List', {
	extend: 'Ext.view.View',
	alias: 'widget.chat-gutter-list-view',

	requires: [
		'NextThought.app.chat.StateStore',
		'NextThought.app.chat.Actions'
	],

	cls: 'chat-gutter-list-window',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn: [
			{cls: 'title', html: 'Messenger'},
			{cls: 'close'}
		]},
		{cls: 'list'},
		{cls: 'footer', cn: [
			{cls: 'presence-gutter-entry show-contacts', cn: [
				{cls: 'name', html: 'Contacts'}
			]}
		]}
	]),

	renderSelectors: {
		frameBodyEl: '.list',
		header: '.header',
		closeBtn: '.header .close'
	},

	getTargetEl: function() { return this.frameBodyEl; },

	itemSelector: '.presence-gutter-entry',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'for': '.', cn: [
			{cls: 'presence-gutter-entry', cn: [
				{cls: 'name', html: '{displayName}'},
				{cls: 'profile-pic', 'data-badge': '{[this.getBadgeCount(values)]}', cn: [
					'{[this.getAvatar(values)]}',
					{cls: 'presence {[this.getPresence(values)]}'}
				]}
			]}
		]}
	]), {
		getBadgeCount: function(model) {
			return model.unreadMessageCount || 0;
		},
		getPresence: function(model) {
			this.ChatStore = NextThought.app.chat.StateStore.getInstance();
			return this.ChatStore.getPresenceOf(model.Username);
		},
		getAvatar: function(model) {
			var a = NTIFormat.avatar(model);
			return a;
		}
	}),

	initComponent: function() {
		this.callParent(arguments);
		this.on('itemclick', this.onItemClicked.bind(this));
	},


	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.closeBtn, 'click', this.hide.bind(this));
	},


	onItemClicked: function(view, user, item, index, e) {
		this.openChatWindow(user);
	},


	bindChatWindow: function(win, user) {
		var roomInfo = win && win.roomInfo,
			isGroupChat = roomInfo.isGroupChat(),
			me = this;


		if (!isGroupChat && user) {
			user.associatedWindow = win;
			win.onceRendered
				.then(function() {
					wait()
						.then(me.realignChatWindow.bind(me, win, user));
				});
		}
	}
});
