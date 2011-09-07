var COOKIE = '_z';

Ext.define('NextThought.controller.Login', {
    extend: 'Ext.app.Controller',
    requires:[
    		'NextThought.util.Base64',
    		'NextThought.proxy.UserDataLoader',
            'Ext.util.Cookies'
    		],

	views: [
        'LoginWindow',
        'widgets.SessionInfo'
    ],

    init: function() {
       	this.control({
    		'loginwindow': {
                'initialized': function(win){
                    if (Ext.util.Cookies.get(COOKIE)){
                        try{
                            var c = Ext.JSON.decode(Ext.util.Cookies.get(COOKIE));
                            win.setUsername(decodeURIComponent(c.u));
                            win.setRemember();
                        }
                        catch(e){
                            console.log(e, e.message);
                        }

                        this.attemptLogin(null, win.callback, function(){win.show();});
                    }
                    else
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
                'logout': this.handleLogout
            }
        });
    },
    
	handleLogout: function() {
        var dt = Ext.Date.add(new Date(), Ext.Date.MONTH, -1);
        Ext.util.Cookies.set(COOKIE, '', dt);
        window.location.reload();
    },

	attemptLogin: function(values, successCallback, failureCallback){
		values = this.sanitizeValues(values);
		//try to auth for future calls to server
		var m = this,
            s = _AppConfig.server,
            c = Ext.JSON.decode(Ext.util.Cookies.get(COOKIE)),
			a = (!values) ? c.a : Base64.basicAuthString(values.username, values.password);

        if (!values) values = Base64.getAuthInfo(c.a);

		try{
            Ext.Ajax.request({
				url: s.host + s.data + 'users/' + values.username,
				headers:{ "Authorization": a},
				callback: function(q,success,r){

                    if(success){
                        //Auto inject all future request with the auth string
                        Ext.Ajax.defaultHeaders = Ext.Ajax.defaultHeaders || {};
                        Ext.Ajax.defaultHeaders['Authorization']= a;

                        Ext.copyTo(s, values, 'username');
                        Ext.copyTo(Ext.Ajax, values, 'username,password');

                        var dt = Ext.Date.add(new Date(), Ext.Date.MONTH, 1);
                        Ext.util.Cookies.set(COOKIE, Ext.JSON.encode({a:a, u:values.username}), values.remember ? dt : null);

                        UserDataLoader.resolveUser(values.username, function(user){
                            s.userObject = user;
                            successCallback.call(m);
                        });
                    }
                    else
                        failureCallback.call(m);

                }
			});
		}
		catch(e){
			console.log('AttemptLogin Exception: ', e);
		}
	},
	
	sanitizeValues: function(values){
		if(values)
	        values.username = encodeURIComponent(values.username);

		return values;
	},

    loginClicked: function(button) {
	    var win    = button.up('window'),
	        form   = win.down('form'),
	        values = form.getValues(),
            m      = form.down('panel[name=login-message]');


        win.el.mask('Please Wait...');
        win.doLayout();

		if(!form.getForm().isValid()) {
            tryAgain();
			return;
		}

        this.attemptLogin(values, success, tryAgain);

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