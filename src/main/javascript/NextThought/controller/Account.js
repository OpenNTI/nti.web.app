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
		'UserSearch',
		'FriendsList'
	],

	views: [
		'account.Window',
		'form.AccountForm',
        'form.PasswordResetForm',
        'menus.Settings',
        'account.coppa.Main',
        'account.code.Main',
        'account.recovery.Email',
        'account.contact.Window',
		'account.codecreation.Window',
		'account.contacts.createlist.Window',
		'account.contacts.View',
		'account.code.Window',
		'profiles.Panel'
	],

	refs: [],

	init: function() {
		this.listen({
			component: {
				'contact-card':{
					'click': 'contactCardClicked'
				},

				'settings-menu [href]' : {
					'click': 'openHref'
				},

				'settings-menu [action=privacy]' : {
					'click': 'showPrivacy'
				},

				'settings-menu [action=childrens-privacy]' : {
					'click': 'showChildrensPrivacy'
				},

				'settings-menu [action=help]' : {
					'click': 'openHelp'
				},

				'settings-menu [action=terms]' : {
					'click': 'showTerms'
				},

				'profile-panel':{
					'edit': 'showAccount'
				},

				'settings-menu [action=account]' : {
					'click': 'showAccount'
				},

				'settings-menu [action=welcome]' : {
					'click': 'showPermanantWelcome'
				},

				'settings-menu [action=contact]' : {
					'click': 'showContactUs'
				},

				'profile-panel':{
					'request-alias-change': 'requestAliasChange'
				},

				'password-reset-form button[save]' : {
					'click': 'changePassword'
				},

				'coppa-main-view button[name=submit]' : {
					'click': 'submitCoppaInfo'
				},

				'recovery-email-view button[name=submit]': {
					'click': 'fixEmail'
				},

				'contact-main-view button[name=submit]': {
					'click': 'contactFormSubmit'
				},

				'code-main-view button[name=submit]': {
					'click': 'groupCodeSubmit'
				},
                'code-main-view simpletext[name=code]': {
                    'changed': 'groupCodeChanged',
                    'specialkey': 'groupCodeSpecialKey'
                },

				'*': {
					'resend-consent': 'resendConsent'
				},

				'group-buttons' : {
					'click': 'groupButtonClicked'
				},

				'list-buttons' : {
					'click': 'groupButtonClicked'
				}

			}
		});
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


	requestAliasChange: function(){
		Ext.widget('contact-us-window', {role: 'alias', titleKey: 'alias_request_title', detailKey: 'alias_request_message'}).show();
	},


	showPermanantWelcome: function(cmp){
		this.guideWin = Ext.widget('welcome-guide', {link: cmp.link});
		this.guideWin.show();
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

    groupCodeSpecialKey: function(el, event) {
        var val = el.lastValue,
            empty = Ext.isEmpty(val);
        if (event.getKey() === event.RETURN && !empty) {
            this.groupCodeSubmit(el);
        }
    },

    groupCodeChanged: function(value, t) {
        var val = value.trim(),
            empty = Ext.isEmpty(val),
            view = t.up('.code-main-view'),
            btn = view.down('button[name=submit]');
        btn.setDisabled(empty);
        if(empty){
            t.getEl().down('input').addCls('empty');
        }
        else{
            t.getEl().down('input').removeCls('empty');
        }
    },

    groupCodeSubmit: function(btn){
        var view = btn.up('code-main-view'),
            data = {invitation_codes: [view.getValue().code]},
            url = $AppConfig.userObject.getLink('accept-invitations'),
            w = view.up('window');

        if (!url){
            view.setError({field: 'Code', message:'There was an error applying your Group Code.'});
            return;
        }

        Ext.Ajax.request({
            url: getURL(url),
            scope: this,
            jsonData: Ext.encode(data),
            method: 'POST',
            headers: {
                Accept: 'application/json'
            },
            callback: function(q,success,r){
				var store;
                btn.removeCls('disabled');
                if(!success){
                    view.setError({field:'Group Code', message: 'The code you entered is not valid.'});
                    return;
                }
                else {
					store = this.getFriendsListStore();
					if(store){
						console.warn('Performing expensive reload of friends list store.', store);
						store.reload();
					}
                    w.close();
                }
            }
        });
    },


	contactUsBodyForMessage: function(data){
		var body = data.email || '[NO EMAIL SUPPLIED]';
		body += (' wrote: ' + data.message);
		return body;
	},


	aliasBodyForMessage: function(data){
		var body = data.email || '[NO EMAIL SUPPLIED]';
		body += (' has requested an alias change for account '+$AppConfig.username);
		body += ('. message: ' + data.message);
		return body;
	},


    contactFormSubmit: function(btn){
        var view = btn.up('contact-main-view'),
            data = view.getValues(),
            feedbackLink = $AppConfig.userObject.getLink('send-feedback'),
            url = getURL(feedbackLink),
            w = view.up('window'),
			bodyFormatters = {
				contact: this.contactUsBodyForMessage,
				alias: this.aliasBodyForMessage
			},
            body;

        //first diable the button:
        btn.addCls('disabled');
        if(!data.message) {
            console.log('no message to send.');
            w.close();
            return;
        }

        if (!feedbackLink) {
            console.error('Nowhere to seed feedback to');
            w.close();
            return;
        }

        if(Ext.isFunction(bodyFormatters[w.role])){
			body = bodyFormatters[w.role](data);
		}
		else{
			console.log('Unknown role for contact window');
			w.close();
			return;
		}

        Ext.Ajax.request({
            url: url,
            scope: this,
            jsonData: Ext.encode({body: body}),
            method: 'POST',
            headers: {
                Accept: 'application/json'
            },
            callback: function(q,success,r){
                btn.removeCls('disabled');
                if(!success){
                    view.setError(Ext.decode(r.responseText));
                }
                else {
                    w.close();
                }
            }
        });
    },


    resendConsent: function(){
        if ($AppConfig.userObject.getLink('contact-email-sends-consent-request')){
            this.getController('Session').showEmailRecoveryWindow('contact_email', 'contact-email-sends-consent-request');
        }
    },


    groupButtonClicked: function(btn){
		var flyBtn = Ext.fly(btn);
        if (flyBtn.hasCls('join-group')){
            this.codeWin = Ext.widget('code-window');
            this.codeWin.show();
        }
		else if(flyBtn.hasCls('create-group')){
			this.codeCreationWin = Ext.widget('codecreation-window');
            this.codeCreationWin.show();
		}
		else if(flyBtn.hasCls('create-list')){
			this.createListWin = Ext.widget('createlist-window');
			this.createListWin.show();
		}
        else {
            console.error('Group button clicked but I do not know what to do', btn);
        }

    },


    fixEmail: function(btn){
        var view = btn.up('recovery-email-view'),
            value = view.getValue(),
            linkToDelete = $AppConfig.userObject.getLink(value.linkName),
            email = value.email,
            fieldName = value.fieldName,
            optionalLinkName;


        if (value.linkName === 'contact-email-sends-consent-request'){
            //this link does not require delete, but we do want to request a specific link when saving:
            linkToDelete = null;
            optionalLinkName = value.linkName;
        }

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

        function success(){
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

        function fail(resp){
            view.setError(Ext.decode(resp.responseText));
        }

        if (fieldName && email){
            //$AppConfig.userObject.set(fieldName, email);
            //$AppConfig.userObject.save({callback: callback});

            $AppConfig.userObject.saveField(fieldName, email, success, fail, optionalLinkName);
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
		this.fireEvent('set-location','tag:nextthought.com,2011-10:NextThought-HTML-NextThoughtHelpCenter.tableofcontents');
	},


    showChildrensPrivacy: function(item){
        var user = $AppConfig.userObject,
            link = user.getLink('childrens-privacy');

        if(Ext.isEmpty(link)){ return; }

        if (!this.childPrivacyWin) {
            this.childPrivacyWin = this.createWin('Children\'s Privacy', getURL(link));
        }
        this.childPrivacyWin.show();
    },


	showPrivacy: function(item){
		var user = $AppConfig.userObject,
            link = user.getLink('content.permanent_general_privacy_page');

        if(Ext.isEmpty(link)){ return; }

        if (!this.privacyWin) {
			this.privacyWin = this.createWin('Privacy', getURL(link));
		}
		this.privacyWin.show();
	},


	showTerms: function(item){
		if (!this.termsWin) {
			this.termsWin = this.createWin('Terms of Service',
					$AppConfig.links.terms_of_service);
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
