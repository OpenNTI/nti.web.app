//SCSS defined _identity.scss
Ext.define('NextThought.view.account.Identity', {
	extend: 'Ext.Component',
	alias:  'widget.identity',

	requires: [
		'NextThought.view.menus.Settings'
	],
	mixins:   {
		enableProfiles: 'NextThought.mixins.ProfileLinks'
	},

	profileLinkCard: false,

	cls:      'identity',
	autoShow: true,
	floating: true,

	renderTpl: Ext.DomHelper.markup(
			[
				{ tag: 'img', src: '{avatarURL}', cls: 'avatar', 'data-qtip': '{displayName}'},
				{ cls: 'presence' }
			]),

	renderSelectors: {
		avatar:   'img.avatar',
		presence: '.presence'
	},


	initComponent: function () {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, $AppConfig.userObject.data);
		this.menu = Ext.widget({xtype: 'settings-menu'});
		this.on('destroy', 'destroy', this.menu);
		this.monitorUser($AppConfig.userObject);
	},


	monitorUser: function (u) {
		var me = this, m = {
			scope: this,
			destroyable: true,
			'changed': function (r) {
				me.avatar.set({ src: r.get('avatarURL'), 'data-qtip': r.getName() });
				me.monitorUser((r !== u) ? r : null);
			}
		};

		if (u) {
			Ext.destroy(me.userMonitor);
			me.userMonitor = me.mon(u, m);
			me.user = u;
		}

		if (me.presence && me.user) {
			me.presence.set({cls: 'presence ' + me.user.getPresence().getName()});
		}
	},


	afterRender: function () {
		var me = this;
		this.callParent(arguments);
		this.monitorUser(this.user);
		this.mon(this.el, {
			'mouseover': 'startToShowMenu',
			'mouseout':  'startToHideMenu'
		});

		this.mon(this.menu, 'mouseenter', 'cancelHideShowEvents');

		this.enableProfileClicks(this.avatar);

		if (Ext.is.iPad) {
			// Prevent the save/copy image menu from appearing
			this.el.down('img').setStyle('-webkit-touch-callout', 'none');
			// Prevent the status menu from appearing after a click
			this.el.down('img').dom.addEventListener('click', function (e) {
				me.cancelHideShowEvents();
			});
		}
	},


	cancelHideShowEvents: function () {
		clearTimeout(this.showTimout);
		clearTimeout(this.hideTimout);
	},


	startToShowMenu: function () {
		var me = this;

		this.cancelHideShowEvents();

		this.showTimout = setTimeout(function () {
			me.menu.showBy(me.el, 'tr-br', [0, 0]);
		}, 500);
	},


	startToHideMenu: function () {
		var me = this;

		this.cancelHideShowEvents();

		if (!Ext.is.iPad || this.menu.isHidden()) { // On iPad, don't hide menu if it's already shown
			this.hideTimout = setTimeout(function () {
				me.menu.hide();
			}, 500);
		}
	}
});
