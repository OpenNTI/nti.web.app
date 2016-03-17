export default Ext.define('NextThought.app.chat.components.gutter.List', {
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
		closeBtn: '.header .close',
		contactsEl: '.footer .show-contacts'
	},

	getTargetEl: function() { return this.frameBodyEl; },

	itemSelector: '.presence-gutter-entry',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'for': '.', cn: [
			{cls: 'presence-gutter-entry', 'data-qtip': '{displayName}', cn: [
				{cls: 'name', html: '{displayName}'},
				{cls: 'profile-pic {[this.getPresence(values)]}', 'data-badge': '{[this.getBadgeCount(values)]}', cn: [
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
			var ChatStore = NextThought.app.chat.StateStore.getInstance(),
				presence = ChatStore.getPresenceOf(model.Username);

			return (presence && presence.getName()) || '';
		},
		getAvatar: function(model) {
			var a = NTIFormat.avatar(model);
			return a;
		}
	}),

	initComponent: function() {
		this.callParent(arguments);
		this.on('itemclick', this.onItemClicked.bind(this));
		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.closeBtn, 'click', this.hideOtherContacts.bind(this));
		this.mon(this.contactsEl, 'click', this.goToContacts.bind(this));
		this.addToggleListeners();
		this.gutter.on({
			destroy: this.destroy.bind(this)
		});
	},


	addToggleListeners: function() {
		var me = this;
		// When this list is shown, hide the gutter and vice-versa.
		this.on({
			show: function() {
				me.gutter.hide();
				if (me.gutter.activeUser) {
					me.selectActiveUser(me.gutter.activeUser);
				}
			},
			hide: function() {
				me.gutter.show();
				if (me.gutter.activeUser) {
					me.gutter.selectActiveUser(me.gutter.activeUser);
				}
			}
		});

		wait(100)
			.then(function() {
				if (me.gutter.activeUser) {
					me.selectActiveUser(me.gutter.activeUser);
				}
			});
	},


	onItemClicked: function(view, user, item, index, e) {
		this.openChatWindow(user, Ext.get(item));
	},


	goToContacts: function(e) {
		NextThought.app.navigation.Actions.pushRootRoute('Contacts', '/contacts/');
	},


	hideOtherContacts: function() {
		this.ChatStore.fireEvent('hide-all-gutter-contacts', this);
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
