var COOKIE = '_z';

Ext.define('NextThought.controller.Session', {
    extend: 'Ext.app.Controller',

    requires:[
        'NextThought.cache.UserRepository',
        'NextThought.util.Base64',
        'NextThought.proxy.Socket',
        'Ext.util.Cookies'
    ],

    models: [
        'User',
		'Service'
    ],

    views: [
        'windows.LoginWindow',
        'widgets.main.SessionInfo'
    ],

    statics: {
        login: function(app){
            var win = null;
            if (Ext.util.Cookies.get(COOKIE))
                this.attemptLogin(null,success,showLogin);
            else
                showLogin();

            function showLogin(){
                win = Ext.create('NextThought.view.windows.LoginWindow',{callback: success});
            }

            function success(){
                if(win){
                    win.close();
                }

				app.fireEvent('session-ready');

                NextThought.controller.Application.launch();
            }
        },


		clearAuth: function(){
			function clearCookie(name, domain){
				document.cookie = name+'=; expires=Thu, 01-Jan-70 00:00:01 GMT; path=/'+
						(domain? ('; domain='+domain): '');
			}

			if(Ext.Ajax.defaultHeaders)
				delete Ext.Ajax.defaultHeaders.Authorization;

			delete Ext.Ajax.username;
			delete Ext.Ajax.password;

			var domain = _AppConfig.server.domain;

			clearCookie(COOKIE, null);
			clearCookie('auth_tkt',domain);
			clearCookie('auth_tkt','.'+domain);
		},


        setupAuth: function(username, password, remember){
            var r = !!(remember || this.shouldRemember()),
                a = Base64.basicAuthString( username, password );

			this.clearAuth();

            //Auto inject all future request with the auth string
            Ext.Ajax.defaultHeaders = Ext.Ajax.defaultHeaders || {};
            Ext.Ajax.defaultHeaders.Authorization= a;
            Ext.Ajax.defaultHeaders.Accept= '*/*';
            Ext.Ajax.username = encodeURIComponent(username);
            Ext.Ajax.password = password;

            Ext.util.Cookies.set(COOKIE, Ext.JSON.encode({a:a, u:username, r:r}),
                r ? Ext.Date.add(new Date(), Ext.Date.MONTH, 1)
                    : null);
        },


        shouldRemember: function(){
            var c = Ext.JSON.decode(Ext.util.Cookies.get(COOKIE));
            return c && c.r;
        },

        attemptLogin: function(values, successCallback, failureCallback){
            var m = this,
                s = _AppConfig.server,
                c = Ext.JSON.decode(Ext.util.Cookies.get(COOKIE)),
                a = (!values) ? c.a
                    : Base64.basicAuthString( values.username, values.password );

            if (!values) {
                values = Base64.getAuthInfo(c.a);
                values.remember = !!c.r;
            }

            try{
                Ext.Ajax.request({
                    url: s.host + s.data,
                    headers:{
                        'Authorization': a,
                        'Accept': 'application/vnd.nextthought.workspace+json'
                    },
                    scope: this,
                    callback: function(q,success,r){
						if(!success){
							failureCallback.call(m);
							return;
						}
						try{
							_AppConfig.service = Ext.create(
									'NextThought.model.Service',
									Ext.decode(r.responseText),
									values.username);

							m.attemptLoginCallback(values, successCallback, failureCallback);
						}
						catch(e){
							failureCallback.call(m);
						}
					}
                });
            }
            catch(e){
                console.error('AttemptLogin Exception: ', e.message, '\n', e.stack);
            }
        },

		attemptLoginCallback: function(form,successCallback, failureCallback){
			var me = this;
			Ext.copyTo(_AppConfig, form, 'username');

			me.setupAuth(form.username, form.password,!!form.remember);
			Socket.setup(form.username, form.password);

			UserRepository.prefetchUser(form.username, function(users){
				var user = users[0];
				if(user){
					_AppConfig.userObject = user;
					successCallback.call(me);
				}
				else{
					failureCallback.call(me);
				}
			});
		}
    },

    init: function() {
        this.control({
            'loginwindow': {
                'initialized': function(win){
                    if (Ext.util.Cookies.get(COOKIE)){
                        try{
                            var c = Ext.JSON.decode(Ext.util.Cookies.get(COOKIE));
                            win.setUsername(c.u);
                            win.setRemember(true);
                        }
                        catch(e){
                            console.error('Session init',e, e.message);
                        }
                    }
                    win.show();
                }
            },
            'loginwindow button[actionName=login]': {
                'click': this.loginClicked
            },
            'loginwindow button[actionName=cancel]': {
                'click': function(){
                    window.location.replace('http://www.nextthought.com');
                }
            },
            'session-info' : {
                'logout': this.handleLogout,
                'password-changed': function(){
                    this.self.setupAuth.apply(this.self, arguments);
                }
            }
        },{});
    },

    handleLogout: function() {
        var s = _AppConfig.server,
			me = this;

		Socket.tearDownSocket();
		Ext.Ajax.request({
			url: s.host + s.data + 'logout',
			callback: function(){
				me.self.clearAuth();
				window.location.reload();
			}
		});
    },

    loginClicked: function(button) {
        var win    = button.up('loginwindow'),
            form   = win.down('form'),
            values = form.getValues(),
            m      = form.down('panel[name=login-message]');


        win.el.mask('Please Wait...');
        win.doLayout();

        if(!form.getForm().isValid()) {
            tryAgain();
            return;
        }

        this.self.attemptLogin(values, success, tryAgain);

        function success(){
            win.close();
            win.callback();
        }


        function tryAgain(){
            form.getForm().reset();
            m.addCls('error');
            m.update('Could not login, please try again');
            win.doLayout();
            win.el.unmask();
        }
    }
});
