Ext.define('NextThought.view.account.Window',{
	extend: 'NextThought.view.Window',
	alias: 'widget.account-window',

	requires: [
		'NextThought.view.form.PasswordResetForm'
	],

	cls: 'account-window',
	ui: 'account-window',
	minimizable: false,
	constrain: true,
	closable: true,
	modal: true,
	dialog: true,

	width: 520,
	y: 80,

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	defaults: {
		border: false
	},

	items: [],

	constructor: function(){
		var me = $AppConfig.userObject;
		this.items = [{
				xtype: 'box', autoEl: {
					cls: 'identity',
					cn:[
						{ cls: 'close' },
						{ tag: 'img', cls: 'avatar', src: me.get('avatarURL') },
						{
							cls: 'wrap',
							cn: [
								{ cls: 'name', html: me.getName()},
								{ cls: 'affiliation', html: me.get('affiliation')||'affiliation'},
								{
									cls: 'identities',
									cn: [
										{tag: 'span', cls: 'username', html: me.get('Username')||'Username?'},
										{tag: 'span', cls: 'email', html: me.get('email')||'no email'}
									]
								}
							]
						}
					]
				}
			},{
				xtype: 'container',
				defaultType: 'button',
				defaults: {
					ui: 'account',
					flex: 1,
					enableToggle: true,
					toggleGroup: 'account-buttons',
					handler: function(btn){ btn.up('window').changeView(btn); }
				},

				layout: { type: 'hbox', align: 'stretch' },

				items: [
					{text: 'Change Password', associatedPanel: 'password-reset-form'},
					{text: 'Edit Profile Picture', associatedPanel: 'avatar-thingy-rename-when-we-have-this', disabled: true}
				]
			},{
				name: 'settings',
				xtype: 'container',
				hidden: true,
				layout: {
					type: 'card'
				},
				items: [
					{ xtype: 'password-reset-form' },
					{ xtype: 'panel' }
				]
			}];

		return this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon( this.el.down('.close'), 'click', this.close, this);
	},


	changeView: function(btn){
		var c = this.down('[name=settings]'),
			p = c.down(btn.associatedPanel);

		c.getLayout().setActiveItem(p);
		c[btn.pressed?'show':'hide']();

		this.updateLayout();
	}
});
