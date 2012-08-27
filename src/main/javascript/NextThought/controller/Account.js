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
			},

			'my-account-menu menuitem[action=help]' : {
				'click': this.openHelp
			},

			'my-account-menu menuitem[action=terms]' : {
				'click': this.showTerms
			},

			'my-account-menu menuitem[action=account]' : {
				'click': this.showAccount
			}

		},{});
	},


	contactCardClicked: function(cmp,username){
//		this.getController('Chat').enterRoom(username);
	},


	accountActionButton: function(btn){
		var win = btn.up('window'),
			form= win.down('account-form'),
			values = form.getForm().getFieldValues(false),
			u = $AppConfig.userObject,
			fire = false,
			key;

		function callback(record, op){
			if(!op.success){
				console.error('FAILURE:',arguments);
				win.el.down('[name=pw_error]').setStyle('display','inline');
			}
			else {
				win.close();
			}
			u.fireEvent('changed', record);
		}

		if(!form.getForm().isValid()){
			return;
		}

		if(values.password){
			fire = true;
			u.fields.add(new Ext.data.Field({name: 'old_password', type:'string'}));
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
		var me = this;
		var win = Ext.widget({
			xtype: 'nti-window',
			id: 'account-window',
			width: '40%',
			height: '50%',
			dialog: true,
			layout: 'fit',
			items: {
				xtype: 'account-form',
				account: $AppConfig.userObject
			},

			dockedItems: [ {
				dock: 'bottom',
				xtype: 'container',
				cls: 'buttons',
				layout:{ type: 'hbox', pack: 'end' },
				defaults: {ui: 'primary', scale: 'medium'},
				items: [
					{xtype: 'button', text: 'Save', action: 'save', handler: function(btn){
						me.accountActionButton(btn);
					}},
					{xtype: 'button', text: 'Cancel', ui: 'secondary', handler: function(btn){
						btn.up('window').close();
					}}
				]
			}]
		});

		win.show();
	},


	openHref: function(item){
		event.stopPropagation();
		event.preventDefault();
		window.open(item.href, item.hrefTarget);
		return false;
	},


	openHelp: function(){
		LocationProvider.setLocation('tag:nextthought.com,2011-10:NextThought-HTML-NextThoughtHelpCenter.nextthought_help_center');
	},


	showPrivacy: function(item){
		if (!this.privacyWin) {
			this.privacyWin = this.createWin('Privacy', 'https://docs.google.com/document/pub?id=1W9R8s1jIHWTp38gvacXOStsfmUz5TjyDYYy3CVJ2SmM&embedded=true');
		}
		this.privacyWin.show();
	},


	showTerms: function(item){
		if (!this.termsWin) {
			this.termsWin = this.createWin('Terms of Service',
					'https://docs.google.com/document/pub?id=1rM40we-bbPNvq8xivEKhkoLE7wmIETmO4kerCYmtISM&embedded=true');
		}
		this.termsWin.show();
	},


	createWin: function(title, url) {
		return Ext.widget('nti-window',{
			title: title,
			closeAction: 'hide',
			width: '60%',
			height: '75%',
			layout: 'fit',
			modal: true,
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
					style: 'overflow-x: hidden; overflow-y:auto',
				}
			}
		});
	}

});
