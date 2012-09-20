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


    resetPasswordWindow: function(){
        var me = this,
            win;

       win = Ext.widget( 'nti-window',{
            id: 'password-reset-window',

            closeAction: 'destroy',
            modal: true,
            dialog: true,
            layout: 'fit',
            items: {
                xtype: 'password-reset-form'
            },

            dockedItems: [ {
                dock: 'bottom',
                xtype: 'container',
                cls: 'buttons',
                layout:{ type: 'hbox', pack: 'end' },
                defaults: {ui: 'primary', scale: 'medium'},
                items: [
                    {xtype: 'button', text: 'Save', action: 'save', handler: me.resetPassword},
                    {xtype: 'button', text: 'Cancel', ui: 'secondary', handler: function(btn){
                        win.close();
                    }}
                ]
            }]
        });

        win.show();
    },


    resetPassword: function(btn, event){
        var u = $AppConfig.userObject,
            win = btn.up('window'),
            old = win.down('[name=old_password]').getValue(),
            pw = win.down('[name=password]').getValue(),
            pwver = win.down('[name=password-verify]').getValue(),
            json, url;

        if (pw !== pwver) {
            console.error('password and password verify do not match.');
            return;
        }


        //put together the json we want to save.
        json = Ext.JSON.encode({'old_password': old, 'password': pw}),
        url = u.getLink('edit')+'/++fields++\password';


        Ext.Ajax.request({
            url: url,
            jsonData: json,
            method: 'PUT',
            headers: { Accept: 'application/json' },
            failure: function(){
                console.error("field save fail", arguments);
            },
            success: function(){
                win.close();
            }
        });
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
        debugger;
        var form=btn.up('password-reset-form'),
            values = form.getValues(),
            u = $AppConfig.userObject,
            me = this;

        function callback(record, op){
            if(!op.success){
                console.error('FAILURE:',arguments);
                form.el.down('[name=pw_error]').setStyle('display','inline');
            }
            else {
                form.reset();
            }
        }


        u.fields.add(new Ext.data.Field({name: 'old_password', type:'string'}));
        u.fields.add(new Ext.data.Field({name: 'password', type:'string'}));

        for(key in values){
            if(values.hasOwnProperty(key)) {
                u.set(key, values[key]);
            }
        }
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
