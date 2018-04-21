const Ext = require('@nti/extjs');

const {getString} = require('legacy/util/Localization');

require('legacy/common/window/Window');
require('./components/AvatarChoices');
require('./components/PasswordResetForm');
require('./components/PictureEditor');
require('./components/Preferences');


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

	constructor: function () {
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
						toggle: function (btn, pressed) {
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

	afterRender: function () {
		var me = this;

		me.callParent(arguments);

		me.mon(me.el.down('.close'), 'click', me.close, this);

		me.mon($AppConfig.userObject, {
			scope: me,
			'changed': function (r) {
				var el = me.el;

				el.down('.identity div.name').update(r.getName());
				el.down('.identity div.affiliation').update(r.get('affiliation'));
				el.down('.identity .avatar-wrapper').dom.innerHTML = Ext.util.Format.avatar(r);
			}
		});
	},


	syncHeight: function () {},

	/*
	 * This is always going to be positioned  fixed, so don't
	 * let Ext layout try to calculate according to parents.
	 */
	center: function () {
		if (!this.rendered) {
			this.on('afterrender', this.center.bind(this));
			return;
		}

		var dom = this.el && this.el.dom,
			myWidth = this.getWidth(),
			myHeight = this.getHeight(),
			viewWidth = Ext.Element.getViewportWidth(),
			viewHeight = Ext.Element.getViewportHeight(),
			top, left;

		top = (viewHeight - myHeight) / 2;
		left = (viewWidth - myWidth) / 2;

		top = Math.max(top, 0);
		left = Math.max(left, 0);

		dom.style.top = top + 'px';
		dom.style.left = left + 'px';
	},

	changeView: function (btn) {
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
