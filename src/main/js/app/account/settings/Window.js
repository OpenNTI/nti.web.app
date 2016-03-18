var Ext = require('extjs');
var WindowWindow = require('../../../common/window/Window');
var ComponentsPasswordResetForm = require('./components/PasswordResetForm');
var ComponentsPreferences = require('./components/Preferences');
var ComponentsAvatarChoices = require('./components/AvatarChoices');
var ComponentsPictureEditor = require('./components/PictureEditor');


module.exports = exports = Ext.define('NextThought.app.account.settings.Window', {
    extend: 'NextThought.common.window.Window',
    alias: 'widget.account-window',
    cls: 'account-window',
    ui: 'account-window',
    minimizable: false,
    constrain: true,
    closable: true,
    modal: true,
    dialog: true,
    resizable: false,
    width: 535,
    y: 80,
    layout: 'none',
    items: [],

    constructor: function() {
		var user = $AppConfig.userObject,
			canUploadAvatar = Service.canUploadAvatar(),
			availablePanels = [], tabs = [];

		if (canUploadAvatar) {
			availablePanels = [
				{xtype: 'avatar-choices'},
				{xtype: 'picture-editor'}
			];

			tabs.push({text: getString('NextThought.view.account.Window.avatar-choices'), associatedPanel: 'avatar-choices', pressed: true});
		}

		availablePanels.push({xtype: 'password-reset-form'});
		availablePanels.push({xtype: 'account-preferences'});

		tabs.push({text: getString('NextThought.view.account.Window.password'), associatedPanel: 'password-reset-form'});
		tabs.push({text: getString('NextThought.view.account.Window.preferences'), associatedPanel: 'account-preferences'});
		tabs.push({disabled: true, width: 5, cls: 'placeholder'});


		this.items = [
			{
				xtype: 'box',
				autoEl: {
					cls: 'identity',
					cn: [
						{cls: 'close'},
						{cls: 'avatar-wrapper', cn: [
							Ext.util.Format.avatar(user)
						]},
						{cls: 'wrap', cn: [
							{cls: 'name', html: user.getName()},
							{cls: 'affiliation', html: user.get('affiliation')},
							{cls: 'identities', cn: [
								{tag: 'span', cls: 'username', html: (user.get('OU4x4') || user.get('Username'))},
								{tag: 'span', cls: 'email', html: user.get('email')}
							]}
						]}
					]
				}
			},
			{
				xtype: 'container',
				defaultType: 'button',
				cls: 'button-wrapper',
				defaults: {
					ui: 'account',
					enableToggle: true,
					allowDepress: false,
					toggleGroup: 'account-buttons',
					minWidth: 150,
					listeners: {
						toggle: function(btn, pressed) {
							if (pressed) {
								btn.up('window').changeView(btn);
							}
						}
					}
				},
				layout: 'none',

				items: tabs
			},
			{
				name: 'settings',
				xtype: 'container',
				layout: 'card',
				items: availablePanels
			}
		];

		this.callParent(arguments);
	},

    afterRender: function() {
		var me = this;

		me.callParent(arguments);

		me.mon(me.el.down('.close'), 'click', me.close, this);

		me.mon($AppConfig.userObject, {
			scope: me,
			'changed': function(r) {
				var el = me.el;

				el.down('.identity div.name').update(r.getName());
				el.down('.identity div.affiliation').update(r.get('affiliation'));
				el.down('.identity .avatar-wrapper').dom.innerHTML = Ext.util.Format.avatar(r);
			}
		});
	},

    syncHeight: function() {},

    changeView: function(btn) {
		var c = this.down('[name=settings]'),
			p = c.down(btn.associatedPanel);

		if (c.getLayout().getActiveItem() !== p) {
			c.getLayout().setActiveItem(p);
			c[btn.pressed ? 'show' : 'hide']();
			this.updateLayout();
			this.center();
		}
	}
});
