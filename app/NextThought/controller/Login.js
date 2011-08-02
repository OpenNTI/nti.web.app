

Ext.define('NextThought.controller.Login', {
    extend: 'Ext.app.Controller',

	views: [
        'LoginWindow'
    ],

    init: function() {
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
    
    
    attemptLogin: function(button) {
	    var win    = button.up('window'),
	        form   = win.down('form'),
	        values = form.getValues();

		if(!form.getForm().isValid()){
			return;
		}
		
		Ext.apply(_AppConfig.server, values);
		
	    win.close();
		win.callback();
	}
});