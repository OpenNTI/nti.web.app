var Ext = require('extjs');
var NTIFormat = require('../../../util/Format');
var ComponentsSettings = require('./components/Settings');


module.exports = exports = Ext.define('NextThought.app.account.identity.Index', {
	extend: 'Ext.Component',
	alias: 'widget.identity',
	cls: 'identity x-menu',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'profile-pic', 'data-qtip': '{user:displayName}', cn: [
			'{user:avatar}',
			{cls: 'presence'}
		]}
	]),

	renderSelectors: {
		avatar: '.profile-pic',
		presence: '.profile-pic .presence',
		name: '.name'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			user: $AppConfig.userObject
		});

		this.menu = Ext.widget({xtype: 'settings-menu', ownerCt: this, setMenuClosed: this.setMenuClosed.bind(this)});

		this.on('destroy', 'destroy', this.menu);
		this.monitorUser($AppConfig.userObject);
	},

	monitorUser: function (user) {
		var me = this,
			m = {
				scope: this,
				destroyable: true,
				'changed': function (r) {
					var profile = me.avatar && me.avatar.down('.avatar-pic'),
						a;

					if (profile) {
						a = NTIFormat.avatar(r);
						profile.dom.innerHTML = a;
						profile.set({'data-qtip': r.getName()});
					}

					me.monitorUser((r !== user) ? r : null);
				}
			};

		if (user) {
			Ext.destroy(me.userMonitor);
			me.userMonitor = me.mon(user, m);
			me.user = user;
		}

		if (me.presence && me.user) {
			me.presence.set({cls: 'presence ' + me.user.getPresence().getName()});
		}
	},

	afterRender: function () {
		var me = this;

		this.callParent(arguments);
		this.monitorUser(me.user);

		this.mon(this.el, {
			'click': 'toggleMenu'
			//TODO: do we want to hide this on mouse out, or just on click?
			// 'mouseout': 'startToHideMenu'
		});

		this.mon(this.menu, {
			// 'mouseenter': 'cancelHideShowEvents',
			'show': this.addCls.bind(this, 'menu-showing'),
			'hide': this.removeCls.bind(this, 'menu-showing')
		});

		if (Ext.is.iOS) {
			//TODO: I don't think these are needed any more
			// // Prevent the save/copy image menu from appearing
			// this.el.down('img').setStyle('-webkit-touch-callout', 'none');
			// // Prevent the status menu from appearing after a click
			// this.el.down('img').dom.addEventListener('click', function(e) {
			//	me.cancelHideShowEvents();
			//	Ext.defer(function() {
			//		me.cancelHideShowEvents();
			//	},50);
			// });
		}
	},

	onMenuShow: function () {
		this.menu.show();
	},

	onMenuHide: function () {
		this.menu.hide();
	},

	cancelHideShowEvents: function () {
		clearTimeout(this.hideTimeout);
	},

	toggleMenu: function () {
		if (this.menu.isVisible()) {
			this.setMenuClosed();
		} else {
			// clearTimeout(this.hideTimeout);
			this.setMenuOpen();
		}
	},

	startToHideMenu: function () {
		var me = this;

		this.cancelHideShowEvents();

		if (!Ext.is.iPad || this.menu.isHidden()) {
			this.hideTimeout = setTimeout(function () {
				me.menu.hide();
			}, 500);
		}
	}
});
