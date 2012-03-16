/*
 To look like this:
 '<div style="float: right;  white-space: nowrap; margin-right: 5px">',
 '<span style="padding: 5px; padding-top: 6px;font-size: 12px; vertical-align: middle; cursor: pointer;">'+n+'</span> ',
 ' <span style="width: 24px; height: 23px; padding-top: 2px; display: inline-block; text-align: center; cursor: pointer; vertical-align: middle;margin-top: 2px; background: url(\'resources/images/notify.png\') no-repeat -25px 0px;">0</span> ',
 ' <img src="'+a+'" width=24 height=24 valign=middle> ',
 ' <img src="resources/images/gear.png" width=19 height=19 valign=middle>',
 '</div>'
 */

Ext.define('NextThought.view.widgets.main.SessionInfo', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.session-info',
	requires: [
		'NextThought.util.Globals',
		'NextThought.view.widgets.main.Identity'
	],

	cls: 'x-session-controls',

	width: MIN_SIDE_WIDTH,
	height: 25,
	border: false,
	layout: {type:'hbox', pack: 'end'},
	defaults: {
		height: 25,
		border: false
	},
	stream: [],

	initComponent: function() {
		this.callParent(arguments);
		this.identity = this.add({xtype: 'identity-panel'});
		this.notifier = this.add({html: '<span class="notification-box-widget"></span>'});
	},


	userUpdated: function(newUser) {
		newUser.on('changed', this.userUpdated, this);
		this.update(newUser.get('NotificationCount'));
	},

	update: function(c) {
		var e = this.notifier.el.down('span');
		e.dom.innerHTML = c > 99||isNaN(c) ? '++' : c;
		(c?e.addCls:e.removeCls).call(e, 'unread');
	},

	onNotification: function(){
		var count = this.notifier.el.down('span').dom.innerHTML;
		this.update((parseInt(count,10)+1));
	},

	clearNotifications: function() {
		var e = this.notifier.el.down('span');
		e.removeCls('unread');
		e.dom.innerHTML = 0;
	},

	render: function(){
		var me = this;
		me.callParent(arguments);
		me.userUpdated($AppConfig.userObject);
		me.notifier.el.on('click', me.notifications, me);

		me.menu = Ext.create('Ext.menu.Menu', {items: me.buildMenu()});

		me.menu.on({
			mouseleave: me.hideMenu,
			mouseover: me.showMenu,
			scope: me
		});

		me.identity.el.on({
			mouseleave: me.hideMenu,
			mousemove: me.showMenu,
			mouseover: me.showMenu,
			click: me.showMenu,
			scope: me
		});

		NextThought.controller.Stream.registerChangeListener(me.onNotification, me);
		me.showMenu();
		me.hideMenu();
	},

	buildMenu: function(){
		return [
			{
				text: 'Account',
				iconCls: 'session-myacount',
				scope: this,
				handler: this.account
			},{
				text: 'About',
				href: 'http://nextthought.com',
				hrefTarget: '_blank'
			},{
				text: 'Help',
				href: 'mailto:alpha-support@nextthought.com',
				hrefTarget: '_blank'
			},{
				text: 'Release Notes',
				href: 'https://docs.google.com/document/pub?id=1dUvxe-n1VBuGpFV5CrBrVeaGJ_hH4kzPRiaGN2cWxsg',
				hrefTarget: '_blank'
			},{
				text: 'Terms',
				href: 'https://docs.google.com/document/pub?id=1Qow6gTT8Kxuw7_oD2TJH7tn1HN8u1VkKW6PehgF2dZc',
				hrefTarget: '_blank'
			},{
				text: 'Privacy',
				href: 'https://docs.google.com/document/pub?id=1W9R8s1jIHWTp38gvacXOStsfmUz5TjyDYYy3CVJ2SmM',
				hrefTarget: '_blank'
			},/*{
				text: 'Settings',
				iconCls: 'settings-gear',
				scope: this,
				handler: this.settings
			},*/'-',
			{
				text: 'Logout',
				iconCls: 'session-logout',
				scope: this,
				handler: this.logout
			}
		];
	},

	hideMenu: function(){
		var m = this.menu;
		this.hideMenuTimout = setTimeout(function(){m.hide();},100);
	},

	showMenu: function(){
		clearTimeout(this.hideMenuTimout);
		this.menu.showBy(this.identity.el, 'tr-br?');
	},

	account: function(){
		this.fireEvent('account');
	},

	logout: function(){
		this.fireEvent('logout');
	},

	notifications: function() {
		this.clearNotifications();
		this.fireEvent('notification');
	},

	settings: function(){
		this.fireEvent('settings');
	}
});
