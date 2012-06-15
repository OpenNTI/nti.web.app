Ext.define('NextThought.view.form.AccountForm', {
	extend:'Ext.form.Panel',
	alias: 'widget.account-form',

	requires: [
		'Ext.form.field.Text',
		'Ext.form.FieldSet',
		'NextThought.view.form.fields.ShareWithField'
	],

	ui: 'account',
	border: false,
	bodyPadding: 5,
	autoScroll: true,

	fieldDefaults: {
		labelAlign: 'top',
		labelWidth: 75,
		anchor: '100%',
		allowBlank: false
	},

	layout: 'anchor',
	defaults: {
		ui: 'account',
		layout: 'anchor',
		anchor: '100%',
		border: false,
		padding: 5,
		defaults: {
			ui: 'account',
			layout: 'anchor',
			padding: 5,
			anchor: '100%',
			border: false,
			defaults: {ui: 'account',defaults: {ui: 'account'}}
		}
	},

	gravatarTpl: new Ext.XTemplate(
		'<div style="font-weight: bold; margin-bottom: 5px">Change your avatar at <a href="http://gravatar.com" target="_blank">gravatar.com</a>.</div>',
		'We\'re using {Username}. It may take time for changes made on gravatar.com to appear here.',
		{
			compiled: true,
			disableFormats: true
		}),

	items: [
		{
			layout: 'hbox',
			items: [
				{
					xtype: 'box',
					autoEl: {tag: 'img'},
					width: 64, height: 64,
					avatar: true
				},
				{
					flex: 1,
					items:[
						{
							cls: 'x-real-name-field',
							xtype: 'textfield',
							allowBlank: false,
							emptyText: 'Real name',
							name: 'realname'
						},
						{
							xtype: 'textfield',
							emptyText: 'Alias',
							allowBlank: false,
							name: 'alias',
							fieldLabel: 'Alias',
							padding: 0,
							margin: '10px 10px 10px 0px',
							anchor: '50%'
						},
						{
							margin: '20px 0px',
							xtype: 'box',
							changePassword: true,
							autoEl: {tag: 'a', href: '#', html: 'Change password', style: 'display: block'}
						},
						{
							layout: 'hbox',
							border: false,
							hidden: true,
							changePassword: true,
							defaults: { ui: 'account', flex: 1, disabled: true },
							items:[
								{
									xtype: 'textfield',
									name: 'password',
									fieldLabel: 'New Password',
									inputType: 'password',
									allowBlank: false,
									margin: '5px 5px 5px 0px',
									minLength: 1
								}, {
									xtype: 'textfield',
									name: 'password-verify',
									fieldLabel: 'Verify Password',
									inputType: 'password',
									allowBlank: false,
									margin: '5px 0px 5px 5px',
									validator: function(value) {
										var password = this.previousSibling('[name=password]').getValue();
										return (value === password) ? true : 'Passwords do not match.';
									}
								}
							]
						},
						{
							border: false,
							changeAvatar: true
						},
						{
							border: false,
							margin: '10px 0px',
							defaults: {
								ui: '',
								padding: 0,
								margin: '10px 0px',
								anchor: '100%',
								layout: 'anchor',
								xtype:'fieldset',
								collapsible: true,
								collapsed: true,
								border: false,
								defaults: {
									layout: 'fit',
									xtype: 'container',
									autoEl: {tag: 'div', cls: 'field' },
									defaults: {
										xtype: 'sharewith',
										allowBlank: true
									}
								}
							},
							items:[
								{ title: 'Following',   items: { items: { name: 'following', readOnly: true  } }, collapsed: false },
								{ title: 'Communities', items: { items: { name: 'Communities', readOnly: true } } },
								{ title: 'Accepting',   items: { items: { name: 'accepting'  } } },
								{ title: 'Ignoring',	items: { items: { name: 'ignoring'   } } }
							]
						}
					]
				}
			]
		}
	],


	initComponent: function(){
		this.callParent(arguments);
	},

	afterRender: function(){
		this.callParent(arguments);
		this.down('component[avatar]').el.dom.src = this.account.get('avatarURL').replace(/s=\d+/i, 's=128');
		this.down('component[changePassword]').el.on('click',this.revealPassword,this);

		this.setFieldValue('realname');
		this.setFieldValue('alias');
		this.setFieldValue('accepting');
		this.setFieldValue('following');
		this.setFieldValue('ignoring');
		this.setFieldValue('Communities');

		this.down('panel[changeAvatar]').update(this.gravatarTpl.apply(this.account.data));

	},


	 revealPassword: function(e){
		 e.preventDefault();

		 this.down('component[changePassword]').hide();
		 this.down('panel[changePassword]').show();

		 Ext.each(this.query('textfield[inputType=password]'),function(f){f.enable();});
	 },


	setFieldValue: function(fieldName){
		var rn = this.down('*[name='+fieldName+']');
		rn.setValue(this.account.get(fieldName));
		rn.resetOriginalValue();
	}

});
