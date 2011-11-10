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
        'User'
    ],

    views: [
        'windows.LoginWindow',
        'widgets.main.SessionInfo'
    ],

    statics: {
        login: function(){
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
                NextThought.controller.Application.launch();
            }
        },


        setupAuth: function(username, password, remember){
            var r = !!(remember || this.shouldRemember()),
                a = Base64.basicAuthString( username, password );

            //Auto inject all future request with the auth string
            Ext.Ajax.defaultHeaders = Ext.Ajax.defaultHeaders || {};
            Ext.Ajax.defaultHeaders['Authorization']= a;
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
                a = (!values)
                    ? c.a
                    : Base64.basicAuthString( values.username, values.password );

            if (!values) {
                values = Base64.getAuthInfo(c.a);
                values.remember = !!c.r;
            }

            try{
                Ext.Ajax.request({
                    url: s.host + s.data + 'users/' + values.username,
                    headers:{ "Authorization": a},
                    scope: this,
                    callback: function(q,success,r){
                        if(success){

                            Ext.copyTo(s, values, 'username');
                            this.setupAuth(values.username, values.password,!!values.remember);
                            Socket.setup(values.username, values.password);

                            UserRepository.prefetchUser(values.username, function(users){
                                var user = users[0];

                                if(user){
                                    _AppConfig.userObject = user;
                                    successCallback.call(m);
                                }
                                else{
                                    failureCallback.call(m);
                                }
                            });
                        }
                        else
                            failureCallback.call(m);

                    }
                });
            }
            catch(e){
                console.error('AttemptLogin Exception: ', e.message, '\n', e.stack);
            }
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
                            win.setRemember();
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
        var dt = Ext.Date.add(new Date(), Ext.Date.MONTH, -1);
        Ext.util.Cookies.set(COOKIE, '', dt);
        Socket.tearDownSocket();
        window.location.reload();
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
