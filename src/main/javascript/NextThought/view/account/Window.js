Ext.define('NextThought.view.account.Window', {
	extend: 'NextThought.view.window.Window',
	alias:  'widget.account-window',

	requires: [
		'Ext.toolbar.Spacer',//not sure what below this class needs it, but it synchronously loads if not required. :/
		'NextThought.view.form.PasswordResetForm',
		'NextThought.view.account.settings.RandomGravatarPicker',
		'NextThought.view.account.settings.AvatarChoices',
		'NextThought.view.account.settings.PictureEditor'
	],

	cls:         'account-window',
	ui:          'account-window',
	minimizable: false,
	constrain:   true,
	closable:    true,
	modal:       true,
	dialog:      true,
	resizable:   false,

	width: 535,
	y:     80,

	layout: {
		type:  'vbox',
		align: 'stretch'
	},

	defaults: {
		border: false
	},

	items: [],

	constructor: function () {
		var me = $AppConfig.userObject,
				canUploadAvatar = $AppConfig.service.canUploadAvatar(),
				availablePanels = canUploadAvatar
						? [
									  { xtype: 'avatar-choices' },
									  { xtype: 'picture-editor'},
									  { xtype: 'password-reset-form' }
								  ]
						: [
									  { xtype: 'random-gravatar-picker' },
									  { xtype: 'password-reset-form' }
								  ],
				canVideoSetting = isFeature('video-settings');

		if (canVideoSetting) {
			availablePanels.push({xtype: 'video-settings'});
		}

		this.items = [
			{
				xtype: 'box', autoEl: {
				cls: 'identity',
				cn:  [
					{ cls: 'close' },
					{ tag: 'img', cls: 'avatar', src: me.get('avatarURL') },
					{
						cls: 'wrap',
						cn:  [
							{ cls: 'name', html: me.getName()},
							{ cls: 'affiliation', html: me.get('affiliation')},
							{
								cls: 'identities',
								cn:  [
									{tag: 'span', cls: 'username', html: me.get('Username')},
									{tag: 'span', cls: 'email', html: me.get('email')}
								]
							}
						]
					}
				]
			}
			},
			{
				xtype:       'container',
				defaultType: 'button',
				defaults:    {
					ui:           'account',
					enableToggle: true,
					allowDepress: false,
					toggleGroup:  'account-buttons',
					minWidth:     150,
					listeners:    {
						toggle: function (btn, pressed) {
							if (pressed) {
								btn.up('window').changeView(btn);
							}
						}
					}
				},

				layout: { type: 'hbox', align: 'stretch', pack: 'start' },

				items: [
					canUploadAvatar
							? {text: 'Edit Profile Picture', associatedPanel: 'avatar-choices', pressed: true}
							: {text: 'Change Avatar', associatedPanel: 'random-gravatar-picker', pressed: true},
					{text: 'Change Password', associatedPanel: 'password-reset-form'},
					{text: 'Video Settings', associatedPanel: 'video-settings', hidden: !canVideoSetting},
					{ disabled: true, flex: 1 }
				]
			},
			{
				name:   'settings',
				xtype:  'container',
				layout: {
					type: 'card'
				},
				items:  availablePanels
			}
		];

		this.callParent(arguments);
	},


	afterRender: function () {
		var me = this;
		me.callParent(arguments);

		me.mon(me.el.down('.close'), 'click', me.close, this);

		me.mon($AppConfig.userObject, {
			scope:     me,
			'changed': function (r) {
				var el = me.el;
				el.down('.identity div.name').update(r.getName());
				el.down('.identity div.affiliation').update(r.get('affiliation'));
				el.down('.identity img.avatar').set({src: r.get('avatarURL')});
			}
		});
	},


	syncHeight: Ext.emptyFn,


	changeView: function (btn) {
		var c = this.down('[name=settings]'),
				p = c.down(btn.associatedPanel);

		if (c.getLayout().getActiveItem() !== p) {
			c.getLayout().setActiveItem(p);
			c[btn.pressed ? 'show' : 'hide']();
			this.updateLayout();
		}
	}
});

//TODO if this becomse permanant use it somewhere else
Ext.define('NextThought.view.account.VideoSettings', {
	extend: 'Ext.Component',
	alias:  'widget.video-settings',

	cls: 'video-settings',

	renderTpl: Ext.DomHelper.markup({
										cls:      'prefer-flash-checkbox',
										html:     'Prefer flash video player when possible.',
										tabIndex: 0,
										role:     'button'
									}),

	renderSelectors: {
		preferFlashEl: '.prefer-flash-checkbox'
	},

	afterRender: function () {
		this.callParent(arguments);
		this.mon(this.preferFlashEl, {
			scope: this,
			click: this.checkboxClicked
		});
		this.updateCheckbox();
	},

	updateCheckbox: function () {
		var me = this;
		$AppConfig.Preferences.getPreference('WebApp', function(value){
			if(value){
				me.currentPreference = value;
				me.preferFlashEl[value.get('preferFlashVideo')? 'addCls' : 'removeCls']('checked');
			}
		});
	},

	checkboxClicked: function () {
		var prefer = !this.preferFlashEl.hasCls('checked'); // the dom hasn't updated with the new class yet
		if(this.currentPreference){
			this.currentPreference.set('preferFlashVideo', prefer);
			this.currentPreference.save();
			this.preferFlashEl[prefer? 'addCls' : 'removeCls']('checked');
		}
	}
});

