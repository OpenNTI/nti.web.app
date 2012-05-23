Ext.define('NextThought.controller.Account', {
	extend: 'Ext.app.Controller',

	models: [
		'FriendsList',
		'UnresolvedFriend',
		'UserSearch',
		'User'
	],

	stores: [
		'UserSearch'
	],

	views: [
		'form.AccountForm',
		'account.contacts.Card'
	],

	refs: [],

	init: function() {
		this.control({
			'#account-window button[actionName]':{
				'click': this.accountActionButton
			},

			'contact-card':{
				'click': this.contactCardClicked
			},

			'my-account-menu menuitem[href]' : {
				'click': this.openHref
			},

			'my-account-menu menuitem[action=privacy]' : {
				'click': this.showPrivacy
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
	},


	openHref: function(item){
		event.stopPropagation();
		event.preventDefault();
		window.open(item.href, item.hrefTarget);
		return false;
	},


	showPrivacy: function(item){
		if (!this.privacyWin) {
			this.privacyWin = this.createWin('Privacy', 'https://docs.google.com/document/pub?id=1W9R8s1jIHWTp38gvacXOStsfmUz5TjyDYYy3CVJ2SmM');
		}
		this.privacyWin.show();
	},


	createWin: function(title, url) {
		return Ext.widget('nti-window',{
			title: title,
			closeAction: 'hide',
			width: '60%',
			height: '75%',
			layout: 'fit',
			items: {
				xtype: 'component',
				cls: 'padded',
				autoEl: {
					tag: 'iframe',
					src: url,
					frameBorder: 0,
					marginWidth: 0,
					marginHeight: 0,
					seamless: true,
					transparent: true,
					allowTransparency: true,
					style: 'overflow: hidden'
				}
			}
		});
	}

});
