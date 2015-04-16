//SCSS defined _identity.scss
Ext.define('NextThought.view.account.Identity', {
	extend: 'Ext.Component',
	alias: 'widget.identity',

	requires: [
		'NextThought.view.menus.Settings'
	],
	// mixins: {
	//	enableProfiles: 'NextThought.mixins.ProfileLinks'
	// },

	profileLinkCard: false,

	cls: 'identity x-menu',
	autoShow: true,
	floating: true,

	renderTpl: Ext.DomHelper.markup(
			[
				{ tag: 'img', src: '{avatarURL}', cls: 'avatar', 'data-qtip': '{displayName:htmlEncode}'},
				{ cls: 'presence' }
			]),

	renderSelectors: {
		avatar: 'img.avatar',
		presence: '.presence'
	},


	initComponent: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, $AppConfig.userObject.data);
		this.menu = Ext.widget({xtype: 'settings-menu', ownerCt: this});
		this.on('destroy', 'destroy', this.menu);
		this.monitorUser($AppConfig.userObject);
	},


	monitorUser: function(u) {
		var me = this, m = {
			scope: this,
			destroyable: true,
			'changed': function(r) {
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


	afterRender: function() {
		var me = this;
		this.callParent(arguments);
		this.monitorUser(this.user);
		this.mon(this.el, {
			'click': 'toggleMenu'
			// 'mouseover': 'startToShowMenu',
			// 'mouseout': 'startToHideMenu'

		});

		this.mon(this.menu, {
			'mouseenter': 'cancelHideShowEvents',
			'show': function() { me.addCls('menu-showing');},
			'hide': function() { me.removeCls('menu-showing');}
		});

		//this.enableProfileClicks(this.avatar);

		if (Ext.is.iOS) {
			// Prevent the save/copy image menu from appearing
			this.el.down('img').setStyle('-webkit-touch-callout', 'none');
			// Prevent the status menu from appearing after a click
			this.el.down('img').dom.addEventListener('click', function(e) {
				me.cancelHideShowEvents();
				Ext.defer(function() {
					me.cancelHideShowEvents();
				},50);
			});
		}
	},


	cancelHideShowEvents: function() {
		clearTimeout(this.showTimeout);
		clearTimeout(this.hideTimeout);
	},


	toggleMenu: function() {
		if (this.menu.isVisible()) {
			this.menu.hide();
		} else {
			clearTimeout(this.showTimeout);
			clearTimeout(this.hideTimeout);
			this.menu.showBy(this.el, 'tr-br', [0, 0]);
		}
	},


	startToShowMenu: function() {
		var me = this;

		this.cancelHideShowEvents();

		if (!Ext.is.iOS) {
			this.showTimeout = setTimeout(function() {
				me.menu.showBy(me.el, 'tr-br', [0, 0]);
			}, 0);//instant!
		}
		else {
			//Delay so that we can avoid showing when clicking
			this.showTimeout = setTimeout(function() {
				me.menu.showBy(me.el, 'tr-br', [0, 0]);
			}, 400);
		}
	},


	startToHideMenu: function() {
		var me = this;

		this.cancelHideShowEvents();

		if (!Ext.is.iPad || this.menu.isHidden()) { // On iPad, don't hide menu if it's already shown
			this.hideTimeout = setTimeout(function() {
				me.menu.hide();
			}, 500);
		}
	}
});
