Ext.define('NextThought.view.account.Window',{
	extend: 'NextThought.view.Window',
	alias: 'widget.account-window',

	requires: [
		'NextThought.view.form.PasswordResetForm',
		'NextThought.view.account.settings.AvatarPicker'
	],

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
								{ cls: 'affiliation', html: me.get('affiliation')},
								{
									cls: 'identities',
									cn: [
										{tag: 'span', cls: 'username', html: me.get('Username')},
										{tag: 'span', cls: 'email', html: me.get('email')}
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
					enableToggle: true,
					toggleGroup: 'account-buttons',
					width: 150,
					handler: function(btn){ btn.up('window').changeView(btn); }
				},

				layout: { type: 'hbox', align: 'stretch', pack: 'start' },

				items: [
					{text: 'Change Avatar', associatedPanel: 'avatar-picker'},
					{text: 'Change Password', associatedPanel: 'password-reset-form'},
					{ disabled:true, flex: 1 }
				]
			},{
				name: 'settings',
				xtype: 'container',
				hidden: true,
				layout: {
					type: 'card'
				},
				items: [
					{ xtype: 'avatar-picker' },
					{ xtype: 'password-reset-form' }
				]
			}];

		return this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon( this.el.down('.close'), 'click', this.close, this);

		this.mon(this.down('password-reset-form button[cancel]'),'click',this.hideForms,this);
	},


	hideForms: function(){
		Ext.each(this.query('[associatedPanel]'),function(o){ o.toggle(false,true); });
		this.down('[name=settings]').hide();
		this.updateLayout();
	},


	changeView: function(btn){
		var c = this.down('[name=settings]'),
			p = c.down(btn.associatedPanel);

		c.getLayout().setActiveItem(p);
		c[btn.pressed?'show':'hide']();

		this.updateLayout();
	}
});
