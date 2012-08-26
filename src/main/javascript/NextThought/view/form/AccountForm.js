/**
 * @deprecated This class heavily needs redesigning. Its filled with bad-practices and hacks.
 */
Ext.define('NextThought.view.form.AccountForm', {
	extend:'Ext.form.Panel',
	alias: 'widget.account-form',

	requires: [
		'Ext.form.field.Text',
		'Ext.form.FieldSet',
		'NextThought.view.form.fields.UserListField'
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
		'<div style="font-weight: bold; margin: 5px 0">Change your avatar at <a href="http://gravatar.com" target="_blank">gravatar.com</a>.</div>',
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
							name: 'realname',
							validator: function(value) {//don't allow "only-whitespace" values
								return (value||'').replace(/^["'\s]+|["'\s]+$/ig,'').length>0;
							}
						},
						{
							xtype: 'textfield',
							emptyText: 'Alias',
							allowBlank: false,
							name: 'alias',
							fieldLabel: 'Alias',
							padding: 0,
							margin: '10px 10px 10px 0px',
							anchor: '50%',
							validator: function(value) {//don't allow "only-whitespace" values
								return (value||'').replace(/^["'\s]+|["'\s]+$/ig,'').length>0;
							}
						},
						{
							xtype: 'textfield',
							emptyText: 'Email Address',
							allowBlank: false,
							name: 'email',
							fieldLabel: 'Email',
							padding: 0,
							margin: '10px 10px 10px 0px',
							anchor: '50%',
							validator: function(value) {//don't allow "only-whitespace" values
								return (value||'').replace(/^["'\s]+|["'\s]+$/ig,'').length>0;
							}
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
									name: 'old_password',
									fieldLabel: 'Current Password',
									inputType: 'password',
									allowBlank: false,
									margin: '5px 5px 5px 0px',
									minLength: 1
								},{
									xtype: 'textfield',
									name: 'password',
									fieldLabel: 'New Password',
									inputType: 'password',
									allowBlank: false,
									margin: '5px 0px 5px 0px',
									minLength: 1,
									validator: function(value) {
										var oldpw = this.previousSibling('[name=old_password]').getValue(),
											sim = this.up('window').down('account-form').similarity;
										if (value.length < 6) { return 'Password too short'; }
										else if (sim(oldpw,value) > 0.6) { return 'New password too similar'; }
										else { return true; }
									}
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
							xtype: 'box',
							autoEl: {
								tag: 'span',
								 name: 'pw_error',
								 html: 'Current password incorrect',
								 style: 'color: red; display: none;'
							}
						},
						{
							border: false,
							changeAvatar: true,
							margin: '10px 0px'
						},
						{
							border: false,
							hidden: true,
							margin: '10px 0px',
							defaults: {
								ui: '',
								padding: 0,
								margin: '10px 0px',
								anchor: '100%',
								layout: 'anchor',
								xtype:'fieldset',
								border: false,
								defaults: {
									layout: 'fit',
									xtype: 'container',
									autoEl: {tag: 'div', cls: 'field' },
									defaults: {
										xtype: 'user-list',
										allowBlank: true
									}
								}
							},
							items:[
								{ title: 'Following',   items: { items: { name: 'following', readOnly: true  } } },
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

	similarity: function(a,b) {
		//Produces equivalent results to those given out by the serverside string similarity algorithm
		//Basically the Levenshtein distance with substitution cost of 2 divided by the sum of the lengths
		var table = [], i = 0, j = 0, d = 0;
		for (i = 0; i <= a.length; i++) {
			table.push([]);
			for (j = 0; j <= b.length; j++) { table[table.length-1].push(i+j); }
		}
		for (d = 2; d <= a.length + b.length; d++) {
			for (j = 1; j < d; j++) {
				i = d - j;
				if (i >= 1 && j >= 1 && i <= a.length && j <= b.length) {
					table[i][j] = Math.min(table[i-1][j-1] + (a[i-1] !== b[j-1]) * 2,table[i][j-1] + 1,table[i-1][j] + 1);
				}
			}
		}
		return 1.0 - table[a.length][b.length] / (a.length + b.length);
	},

	initComponent: function(){
		this.callParent(arguments);
	},

	afterRender: function(){
		this.callParent(arguments);
		this.down('component[avatar]').el.dom.src = this.account.get('avatarURL').replace(/s=\d+/i, 's=128');
		this.down('component[changePassword]').el.on('click',this.revealPassword,this);

		this.setFieldValue('realname');
		this.setFieldValue('alias');
		this.setFieldValue('email');
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
