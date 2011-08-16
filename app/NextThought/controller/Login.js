
Ext.define('NextThought.controller.Login', {
    extend: 'Ext.app.Controller',
    requires:[
    		'NextThought.util.Base64',
    		'NextThought.proxy.UserDataLoader'
    		],

	views: [
        'LoginWindow'
    ],

    init: function() {
    	this.control({
    		'loginwindow': {
    			beforeshow: function(win,opts){
    				//do remember me login stuff here: 
    				if(this.attemptLogin(_AppConfig.server)){
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
            }
        });
    },
    
	
	attemptLogin: function(values){
		values = this.sanitizeValues(values);
		//try to auth for future calls to server
		var s = _AppConfig.server,
			a = Base64.basicAuthString(values.username, values.password),
			success = false;
		
		try{	
			Ext.Ajax.request({
				url: s.host + s.data + 'users/' + values.username, 
				headers:{ "Authorization": a},
				async: false, 
				callback: function(q,s,r){success=s;}
			});
			if(!success)
			return false;
		}
		catch(e){
			console.log(e);
			return false;
		}
		
		//Auto inject all future request with the auth string
		Ext.Ajax.defaultHeaders = Ext.Ajax.defaultHeaders || {};
		Ext.Ajax.defaultHeaders['Authorization']= a;
		Ext.copyTo(s, values, 'username');
		
		s.userObject = UserDataLoader.resolveUser(values.username);
		
		return true;
	},
	
	sanitizeValues: function(values){
		var u = values ? values.username:'';
		
		if(u.indexOf('@')<0){
			values.username = u+'@nextthought.com';
		}
		
		return values;
	},

    loginClicked: function(button) {
	    var win    = button.up('window'),
	        form   = win.down('form'),
	        values = form.getValues();

		if(!form.getForm().isValid() || !this.attemptLogin(values)) {
			return;
		}
		
	    win.close();
		win.callback();
	}
});