Ext.define('NextThought.controller.Account', {
	extend: 'Ext.app.Controller',

	models: [
		'FriendsList',
		'UnresolvedFriend',
		'UserSearch',
		'User',
		'UserPasswordSet'
	],

	stores: [
		'UserSearch'
	],

	views: [
		'account.Window',
		'form.AccountForm',
        'form.PasswordResetForm',
		'account.contacts.Card',
        'menus.Settings'
	],

	refs: [],

	init: function() {
		this.control({
			'contact-card':{
				'click': this.contactCardClicked
			},

			'settings-menu [href]' : {
				'click': this.openHref
			},

			'settings-menu [action=privacy]' : {
				'click': this.showPrivacy
			},

			'settings-menu [action=help]' : {
				'click': this.openHelp
			},

			'settings-menu [action=terms]' : {
				'click': this.showTerms
			},

			'settings-menu [action=account]' : {
                'click': this.showAccount
            },

            'password-reset-form [text=Save]' : {
                'click': this.changePassword
            }


		},{});
	},


	contactCardClicked: function(cmp,username){
		if ($AppConfig.service.canChat()){
			this.getController('Chat').enterRoom(username);
		}
		else {
			console.log('Chat requested but user is not permissioned.');
		}
	},


	showAccount: function(){
		var me = this;
		if (me.acctWin && !me.acctWin.isDestroyed) {
			me.acctWin.show();
			return;
		}

		me.acctWin = Ext.widget('account-window');

		me.acctWin.show();
	},


    changePassword: function(btn){
        var form=btn.up('password-reset-form'),
            u = this.getUserPasswordSetModel().fromUser($AppConfig.userObject);

        function callback(req, success, resp){
            if(!success){
                form.setError(Ext.decode(resp.responseText));
            }
            else {
                form.reset();
            }
        }

		u.set(form.getValues());
        u.save({callback: callback});
    },


    openHref: function(item){
		window.open(item.href, item.hrefTarget);
	},


	openHelp: function(){
		LocationProvider.setLocation('tag:nextthought.com,2011-10:NextThought-HTML-NextThoughtHelpCenter.tableofcontents');
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
					style: 'overflow-x: hidden; overflow-y:auto'
				}
			}
		});
	}

});
