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
        'menus.Settings',
        'account.coppa.Main',
        'account.recovery.Email',
        'account.contact.Window'
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

            'settings-menu [action=childrens-privacy]' : {
                'click': this.showChildrensPrivacy
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

            'settings-menu [action=contact]' : {
                'click': this.showContactUs
            },

            'password-reset-form button[save]' : {
                'click': this.changePassword
            },

            'coppa-main-view button[name=submit]' : {
                'click': this.submitCoppaInfo
            },

            'recovery-email-view button[name=submit]': {
                'click': this.fixEmail
            },

            'contact-main-view button[name=submit]': {
                'click': this.contactFormSubmit
            }

		},{});
	},


	contactCardClicked: function(cmp,username){
		if ($AppConfig.service.canChat() && !isMe(username)){
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


    showContactUs: function(){
        var me = this;
        if (me.contactUsWin && !me.contactUsWin.isDestroyed) {
            me.contactUsWin.show();
            return;
        }

        me.contactUsWin = Ext.widget('contact-us-window');

        me.contactUsWin.show();
    },


    changePassword: function(btn){
        var form=btn.up('password-reset-form'),
            u = this.getUserPasswordSetModel().fromUser($AppConfig.userObject);

        function callback(req, success, resp){
            if(!success){
                form.setError(Ext.decode(resp.responseText));
            }
            else {
				form.setSuccess();
                form.reset();
            }
        }

		u.set(form.getValues());
        u.save({callback: callback});
    },


    contactFormSubmit: function(btn){
        var view = btn.up('contact-main-view'),
            data = view.getValues(),
            key,
            feedbackLink = $AppConfig.userObject.getLink('send-feedback');
            url = getURL(feedbackLink),
            w = view.up('window');

        //first diable the button:
        btn.addCls('disabled');

        if (!feedbackLink) {
            console.error('Nowhere to seed feedback to');
            w.close();
        }

        Ext.Ajax.request({
            url: url,
            scope: this,
            jsonData: Ext.encode(data),
            method: 'POST',
            headers: {
                Accept: 'application/json'
            },
            callback: function(q,success,r){
                btn.removeCls('disabled');
                if(!success){
                    view.setError(Ext.decode(r.responseText));
                    return;
                }
                else {
                    w.close();
                }
            }
        });
    },


    fixEmail: function(btn){
        var view = btn.up('recovery-email-view'),
            value = view.getValue(),
            linkToDelete = $AppConfig.userObject.getLink(value.linkName),
            email = value.email,
            fieldName = value.fieldName;


        function callback(req, success, resp){
            if(!success){
                view.setError(Ext.decode(resp.responseText));
            }
            else {
                view.up('window').close();
                if (linkToDelete){
                    //we need to delete the link now.
                    Ext.Ajax.request({
                        url: getURL(linkToDelete),
                        timeout: 20000,
                        scope: this,
                        method: 'DELETE',
                        callback: function(q,success,r){
                            if(!success){
                                console.log('Could not delete the needs.updated link');
                                return;
                            }
                        }
                    });
                }

            }
        }

        if (fieldName && email){
            $AppConfig.userObject.set(fieldName, email);
            $AppConfig.userObject.save({callback: callback});
        }
    },


    submitCoppaInfo: function(btn) {
        var view = btn.up('coppa-main-view'),
            values = view.getValues(),
            linkToDelete = $AppConfig.userObject.getLink('account.profile.needs.updated'),
            key;

        function callback(req, success, resp){
            if(!success){
                view.setError(Ext.decode(resp.responseText));
            }
            else {
                view.up('window').close();
                if (linkToDelete){
                    //we need to delete the link now.
                    Ext.Ajax.request({
                        url: getURL(linkToDelete),
                        timeout: 20000,
                        scope: this,
                        method: 'DELETE',
                        callback: function(q,success,r){
                            if(!success){
                                console.log('Could not delete the needs.updated link');
                                return;
                            }
                        }
                    });
                }

            }
        }

        if (!values.firstname){
            view.setError({field: 'firstname', message:'First Name is required'});
            return;
        }
        if (!values.lastname){
            view.setError({field: 'lastname', message:'Last Name is required'});
            return;
        }

        delete values.firstname;
        delete values.lastname;

        for (key in values){
            if (values.hasOwnProperty(key) && values[key] !== null) {
                $AppConfig.userObject.set(key, values[key]);
            }
        }

        $AppConfig.userObject.save({callback: callback});
    },


    openHref: function(item){
		window.open(item.href, item.hrefTarget);
	},


	openHelp: function(){
		LocationProvider.setLocation('tag:nextthought.com,2011-10:NextThought-HTML-NextThoughtHelpCenter.tableofcontents');
	},


    showChildrensPrivacy: function(item){
        if (!this.childPrivacyWin) {
            this.childPrivacyWin = this.createWin('Children\'s Privacy', 'https://docs.google.com/document/pub?id=1kNo6hwwKwWdhq7jzczAysUWhnsP9RfckIet11pWPW6k');
        }
        this.childPrivacyWin.show();
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
