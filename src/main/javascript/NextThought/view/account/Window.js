Ext.define('NextThought.view.account.Window',{
	extend: 'NextThought.view.Window',
	alias: 'widget.account-window',

	cls: 'account-window',
	ui: 'account-window',
	minimizable: false,
	closable: true,
	modal: true,
	dialog: true,

	width: 520,

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
					{text: 'Change Password'},
					{text: 'Edit Profile Picture'}
				]
			},{
				hidden: true
				// forms
			}];

		return this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon( this.el.down('.close'), 'click', this.close, this);
	},


	changeView: function(btn){
		console.log('toggle');
	}
});
