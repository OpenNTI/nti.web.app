Ext.define('NextThought.controller.Session', {
	extend: 'Ext.app.Controller',

	requires:[
		'NextThought.cache.UserRepository',
		'NextThought.proxy.Socket',
		'Ext.util.Cookies'
	],

	models: [
		'User',
		'Service'
	],

	views: [
		'Window',
        'menus.Settings'
	],

	sessionTrackerCookie: 'sidt',

	init: function() {
		var me = this;

		me.control({
			'settings-menu [action=logout]' : {
				'click': me.handleLogout
			}
		},{});


		me.sessionId = guidGenerator();

		me.sessionTracker = Ext.TaskManager.newTask({

			interval: 5000, //5 seconds
			run: function(){
				var v = Ext.util.Cookies.get(me.sessionTrackerCookie);
				if(v !== me.sessionId){
					me.sessionTracker.stop();
					Socket.tearDownSocket();

					Ext.MessageBox.alert({
						icon: Ext.Msg.WARNING,
						title: 'Alert',
						msg:'You\'re using the application in another tab. This session has been invalidated.',
						closable: false
					});
				}
			}
		});
	},


	handleLogout: function(keepTracker) {
		var url = getURL(Ext.String.urlAppend(
					this.logoutURL,
					'success='+encodeURIComponent(location.href)));

		if(!keepTracker){
			Ext.util.Cookies.clear(this.sessionTrackerCookie);
		}

		//Log here to help address #550.
		console.log('logout, redirect to ' + url);
		Socket.tearDownSocket();
		app.fireEvent('session-closed');
		location.replace(url);
	},


    maybeShowCoppaWindow: function(){
        var user = $AppConfig.userObject,
            showWindow = user.getLink('account.profile.needs.updated'),
            url = user.getLink('account.profile');

        if (!showWindow){return;}

        Ext.Ajax.request({
            url: getURL(url),
            timeout: 20000,
            scope: this,
            callback: function(q,success,r){
                if(!success){
                    console.log('Could not get acct rel schema for coppa window. Window will not show');
                    return;
                }
                try{
                    var o = Ext.decode(r.responseText);
                    Ext.create('NextThought.view.account.coppa.Window', {schema:o.ProfileSchema}).show();
                }
                catch(e){
                    console.error(Globals.getError(e));
                }
            }
        });

        console.log('get data from ' + url + ' and show coppa window...');
    },


    showEmailRecoveryWindow: function(fieldName, linkName){
        var user = $AppConfig.userObject;

        Ext.create('NextThought.view.account.recovery.Window', {fieldName:fieldName, linkName: linkName}).show();
    },


    immediateAction: function(){
        if (this.coppaWindow){
            this.maybeShowCoppaWindow();
        }
        else if (this.bouncedContact){
            this.showEmailRecoveryWindow('contact_email', 'state-bounced-contact-email');
        }
        else if (this.bouncedEmail){
            this.showEmailRecoveryWindow('email', 'state-bounced-email');
        }
    },


    login: function(app){
        function success(){
			Ext.util.Cookies.set(me.sessionTrackerCookie,me.sessionId);
			me.sessionTracker.start();
            app.fireEvent('session-ready');
            app.on('finished-loading', me.immediateAction, me);

            app.getController('Application').openViewport();
        }

        function showLogin(timedout){
            var url = Ext.String.urlAppend(
                    Ext.String.urlAppend(
                        $AppConfig.server.login,
                        "return="+encodeURIComponent(location.toString())),
                    "host=" + encodeURIComponent(getURL()));

            if(timedout){
                alert('a request timed out');
                return;
            }
            location.replace( url );
        }

		var me = this;
        me.attemptLogin(success,showLogin);
    },


    attemptLogin: function(successCallback, failureCallback){
        var m = this,
            s = $AppConfig.server,
            d = s.data, ping = 'logon.ping',
            u  = decodeURIComponent( Ext.util.Cookies.get('username') );

        function getLink(o, relName){
            o = o || {};
            o = o.responseText || o;
            if(typeof o === 'string') { o = Ext.decode(o); }
            var l = o.Links || [], i = l.length-1;
            for(;i>=0; i--){ if(l[i].rel === relName){ return l[i].href; } }
            return null;
        }
        function maybeTakeImmediateAction(r){
            if (getLink(r, 'account.profile.needs.updated')){
                m.coppaWindow = true;
            }
            else if (getLink(r, 'state-bounced-contact-email')){
                m.bouncedContact = true;
            }
            else if (getLink(r, 'state-bounced-email')){
                m.bouncedEmail = true;
            }
        }

        try{

            Ext.Ajax.request({
                timeout: 60000,
                url: getURL(d + ping),
                callback: function(q,s,r){
                    var l = getLink(r,'logon.handshake');
                    if(!s || !l){
                        if(r.timedout){
                            console.log('Request timed out: ', r.request.options.url);
                        }
                        return Ext.callback(failureCallback,m,[r.timedout]);
                    }
                    Ext.Ajax.request({
                        method: 'POST',
                        timeout: 60000,
                        url: getURL(l),
                        params : {
                            username: u
                        },
                        callback: function(q,s,r){
                            l = getLink(r,'logon.continue');
                            if(!s || !l){
                                if(r.timedout){
                                    console.log('Request timed out: ', r.request.options.url);
                                }
                                return failureCallback.call(m,r.timedout);
                            }
                            maybeTakeImmediateAction(r);
                            m.logoutURL = getLink(r,'logon.logout');
                            m.resolveService(successCallback,failureCallback);
                        }
                    });
                }
            });
        }
        catch(err){
            alert('Could not request handshake from Server.\n'+err.message);
        }
    },


    resolveService: function(successFn, failureFn){
        var m = this,
            s = $AppConfig.server;

        try{
            Ext.Ajax.request({
                url: getURL(s.data),
                timeout: 20000,
                headers:{
                    'Accept': 'application/vnd.nextthought.workspace+json'
                },
                scope: this,
                callback: function(q,success,r){
                    if(!success){
                        alert('Oh No! Could not talk to the server!');
                        m.handleLogout();
                        console.log('Could not resolve service document\nrequest:',q,'\n\nresponse:',r,'\n\n');
                        return;
                    }
                    try{
                        var doc = Ext.decode(r.responseText),
                            user = doc.Items[0].Title;

                        $AppConfig.service = Ext.create('NextThought.model.Service', doc, user);
                        m.attemptLoginCallback(user,successFn);
                    }
                    catch(e){
                        console.error(Globals.getError(e));
                    }
                }
            });
        }
        catch(e){
            console.error('AttemptLogin Exception: ', Globals.getError(e));
        }
    },


    attemptLoginCallback: function(username,successCallback, failureCallback){
        var me = this;
        Socket.setup();

        UserRepository.getUser(username, function(user){
            if(user){
                user.data.Presence = 'Online';
                $AppConfig.userObject = user;
                successCallback.call(me);
            }
            else{
                console.log('could not resolve user',username, arguments);
                failureCallback.call(me);
            }
        });
    }
});
