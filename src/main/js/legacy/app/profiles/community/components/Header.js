var Ext = require('extjs');
var ComponentsHeader = require('../../components/Header');


module.exports = exports = Ext.define('NextThought.app.profiles.community.components.Header', {
	extend: 'NextThought.app.profiles.components.Header',
	alias: 'widget.profile-community-header',

	cls: 'profile-header community-header',


	renderTpl: Ext.DomHelper.markup([
		{cls: 'title'},
		{cls: 'buttons'}
	]),


	renderSelectors: {
		titleEl: '.title',
		buttonsEl: '.buttons'
	},


	initComponent: function () {
		this.callParent(arguments);

		this.onScroll = this.onScroll.bind(this);

		this.on({
			'activate': this.onActivate.bind(this),
			'deactivate': this.onDeactivate.bind(this)
		});
	},


	onActivate: function () {
		window.addEventListener('scroll', this.onScroll);
	},


	onDeactivate: function () {
		window.removeEventListener('scroll', this.onScroll);
	},


	updateEntity: function (community) {
		if (!this.rendered) {
			this.on('afterrender', this.updateEntity.bind(this, community));
			return;
		}

		this.titleEl.update(community.getName());

		this.clearButtons();

		if (community.getLink('join')) {
			this.addButton({
				cls: 'join',
				action: 'onJoin',
				label: 'Join Community'
			});
		} else if (community.getLink('leave')) {
			this.addButton({
				cls: 'leave',
				action: 'onLeave',
				label: 'Leave Community'
			});
		}

		this.buildSettingsMenu(community);
	},


	buildSettingsMenu: function (community) {
		if (this.settingsMenu) {
			Ext.destroy(this.settingsMenu);
		}
		
		return;

		var show = community.getLink('unhide'),
			hide = community.getLink('hide'),
			items = [];

		if (show) {
			items.push({handler: this.onShow.bind(this), text: 'Show'});
		}

		if (hide) {
			items.push({handler: this.onHide.bind(this), text: 'Hide'});
		}

		if (items.length) {
			this.settingsMenu = Ext.widget('menu', {
				cls: 'community-settings-menu',
				ownerCmp: this,
				items: items,
				defaults: {
					ui: 'nt-menuitems',
					xtype: 'menucheckitem',
					plain: true
				}
			});

			this.addButton({
				cls: 'settings',
				action: 'showSettings',
				label: ' '
			});
		}
	},


	onScroll: function () {
		if (this.settingsMenu) {
			this.settingsMenu.hide();
		}
	},


	showSettings: function (el) {
		if (this.settingsMenu) {
			this.settingsMenu.showBy(Ext.get(el), 'tl-bl');
		}
	},


	onJoin: function () {
		this.joinCommunity();
	},


	onLeave: function () {
		this.leaveCommunity();
	},


	onShow: function () {
		this.settingsMenu.hide();
		this.showCommunity();
	},


	onHide: function () {
		this.settingsMenu.hide();
		this.hideCommunity();
	}
});
