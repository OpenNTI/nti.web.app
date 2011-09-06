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
    			beforeshow: function(win,opts){
    				//do remember me login stuff here:
                    if (Ext.util.Cookies.get(COOKIE) && this.attemptLogin()){
                        win.callback();
                        return false;
                    }
    			}
    		},
            'loginwindow button[actionName=login]': {
                click: this.loginClicked
            },
            'loginwindow button[actionName=cancel]': {
                click: function(){
                	window.location.replace('http://www.nextthought.com');
                }
            },
            'session-info' : {
                logout: this.handleLogout
            }
        });
    },
    
	handleLogout: function() {
        var dt = Ext.Date.add(new Date(), Ext.Date.MONTH, -1);
        Ext.util.Cookies.set(COOKIE, '', dt);
        window.location.reload();
    },

	attemptLogin: function(values){
		values = this.sanitizeValues(values);
		//try to auth for future calls to server
		var s = _AppConfig.server,
            c = Ext.JSON.decode(Ext.util.Cookies.get(COOKIE)),
			a = (!values) ? c.a : Base64.basicAuthString(values.username, values.password),
			success = false;

        if (!values) values = Base64.getAuthInfo(c.a);

		try{
            Ext.Ajax.request({
				url: s.host + s.data + 'users/' + values.username,
				headers:{ "Authorization": a},
				async: false,
				callback: function(q,s,r){success=s;}
			});
			if(!success)
			    return false;

            s.userObject = UserDataLoader.resolveUser(values.username);
		}
		catch(e){
			console.log(e);
			return false;
		}
		
		//Auto inject all future request with the auth string
		Ext.Ajax.defaultHeaders = Ext.Ajax.defaultHeaders || {};
		Ext.Ajax.defaultHeaders['Authorization']= a;

		Ext.copyTo(s, values, 'username');
        Ext.copyTo(Ext.Ajax, values, 'username,password');

        var dt = Ext.Date.add(new Date(), Ext.Date.MONTH, 1);
        Ext.util.Cookies.set(COOKIE, Ext.JSON.encode({a:a, u:values.username}), values.remember ? dt : null);

		return true;
	},
	
	sanitizeValues: function(values){
		var u = values ? values.username:'';
		
		if(u && u.indexOf('@')<0){
			values.username = u+'@nextthought.com';
		}
		
		return values;
	},

    loginClicked: function(button) {
	    var win    = button.up('window'),
	        form   = win.down('form'),
	        values = form.getValues(),
            m      = form.down('panel[name=login-message]');


        win.el.mask('Please Wait...');
        win.doLayout();

		if(!form.getForm().isValid() || !this.attemptLogin(values)) {
            form.getForm().reset();
            m.addCls('error');
            m.update('Could not login, please try again');
            win.doLayout();
            win.el.unmask();
			return;
		}
		
	    win.close();
		win.callback();
	}
});