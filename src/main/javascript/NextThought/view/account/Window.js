Ext.define('NextThought.view.account.Window',{
	extend: 'NextThought.view.Window',
	alias: 'widget.account-window',

	requires: [
		'NextThought.view.form.PasswordResetForm',
		'NextThought.view.account.settings.RandomGravatarPicker',
		'NextThought.view.account.settings.AvatarChoices',
		'NextThought.view.account.settings.PictureEditor'
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
//					{text: 'Edit Profile Picture', associatedPanel: 'avatar-choices', pressed:true},
					{text: 'Change Avatar', associatedPanel: 'random-gravatar-picker'},
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
					{ xtype: 'avatar-choices' },
					{ xtype: 'picture-editor'},
					{ xtype: 'random-gravatar-picker' },
					{ xtype: 'password-reset-form' }
				]
			}];

		return this.callParent(arguments);
	},


	afterRender: function(){
		var me = this;
		me.callParent(arguments);

		me.mon( me.el.down('.close'), 'click', me.close, this);

		me.mon($AppConfig.userObject,{
			scope: me,
			'changed': function(r){
				var el = me.el;
				el.down('.identity div.name').update(r.getName());
				el.down('.identity div.affiliation').update(r.get('affiliation'));
				el.down('.identity img.avatar').set({src:r.get('avatarURL')});
			}
		});
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
