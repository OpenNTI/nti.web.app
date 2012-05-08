Ext.define('NextThought.controller.Account', {
	extend: 'Ext.app.Controller',

	models: [
		'FriendsList',
		'UnresolvedFriend',
		'UserSearch',
		'User'
	],

	views: [
		'form.AccountForm',
		'account.contacts.Card',
	],

	refs: [],

	init: function() {
		this.control({
			'#account-window button[actionName]':{
				'click': this.accountActionButton
			},

			'contact-card':{
				'click': this.contactCardClicked
			}


		},{});
	},


	contactCardClicked: function(cmp,username){
		this.getController('Chat').enterRoom(username);
	},


	accountActionButton: function(btn){
		var me = this,
			win = btn.up('window'),
			form= win.down('account-form'),
			values = form.getForm().getFieldValues(false),
			u = $AppConfig.userObject,
			fire = false,
			key;

		function callback(record, op){
			win.close();
			if(!op.success){
				console.error('FAILURE:',arguments);
			}
//			else if(fire){
//				me.getSessionInfo().fireEvent('password-changed', u.get('Username'),values.password);
//			}
		}

		if(btn.actionName !== 'save'){
			win.close();
			return;
		}

		if(!form.getForm().isValid()){
			return;
		}

		if(values.password){
			fire = true;
			u.fields.add(new Ext.data.Field({name: 'password', type:'string'}));
		}
		for(key in values){
			if(values.hasOwnProperty(key)) {
				u.set(key, values[key]);
			}
		}
		u.save({callback: callback});
	},


	showAccount: function(){
		Ext.widget(
			{
				xtype: 'window',
				id: 'account-window',
				items: {
					xtype: 'account-form',
					account: $AppConfig.userObject
				}
			}
		).show();
	}
});
