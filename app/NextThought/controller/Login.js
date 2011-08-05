Ext.require('NextThought.util.Base64');

Ext.define('NextThought.controller.Login', {
    extend: 'Ext.app.Controller',

	views: [
        'LoginWindow'
    ],

    init: function() {
    	this.http = this._getHTTPObject();
    	this.control({
            'loginwindow button[actionName=login]': {
                click: this.attemptLogin
            },
            'loginwindow button[actionName=cancel]': {
                click: function(){
                	window.location.replace('http://www.nextthought.com');
                },
            }
        });
    },
    
    _getHTTPObject: function() {
	    if (typeof XMLHttpRequest != 'undefined') {
	        return new XMLHttpRequest();
	    }
	    try {
	        return new ActiveXObject("Msxml2.XMLHTTP");
	    } catch (e) {
	        try {
	            return new ActiveXObject("Microsoft.XMLHTTP");
	        } catch (e) {}
	    }
	    return false;
	},

    attemptLogin: function(button) {
	    var win    = button.up('window'),
	        form   = win.down('form'),
	        values = form.getValues(),
	        s = _AppConfig.server;

		if(!form.getForm().isValid()){
			return;
		}
		
		//try to auth for future calls to server
		var base64 = Ext.create('Base64');
		var authString = base64.basicAuthString(values.username, values.password);
		this.http.open("GET", s.host + s.data + 'users/' + values.username, false, values.username, values.password);
		this.http.setRequestHeader("Authorization", authString);
		this.http.send('');
		if (this.http.status == 401) {
			return; //we failed auth	
		}
		
		//Auto inject all future request with the auth string
		Ext.Ajax.defaultHeaders = Ext.Ajax.defaultHeaders || {};
		Ext.Ajax.defaultHeaders['Authorization']= authString;
		_AppConfig.server.username = values.username;
		
	    win.close();
		win.callback();
	}
});