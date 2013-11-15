//SCSS defined _identity.scss
Ext.define('NextThought.view.account.Identity', {
	extend: 'Ext.Component',
	alias: 'widget.identity',

	requires: [
		'NextThought.view.menus.Settings'
	],

	profileLinkCard: false,

	cls: 'identity',
	autoShow: true,
	floating: true,

	renderTpl: Ext.DomHelper.markup(
			[
				{ tag: 'img', src: '{avatarURL}', cls: 'avatar',
					'data-qtip': '{displayName:htmlEncode}', style: {
						'-webkit-touch-callout': 'none'
				}},
				{ cls: 'presence' }
			]),

	renderSelectors: {
		avatar: 'img.avatar',
		presence: '.presence'
	},


	initComponent: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, $AppConfig.userObject.data);
		this.menu = Ext.widget({xtype: 'settings-menu'});
		this.on('destroy', 'destroy', this.menu);
		this.monitorUser($AppConfig.userObject);

		this.on({
			el: {
				click: 'showMenu'
			}
		});
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
		this.callParent(arguments);
		this.monitorUser(this.user);
	},


	showMenu: function() {
		this.menu.showBy(this.el, 'tr-br', [0, 0]);
	}
});
