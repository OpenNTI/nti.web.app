

Ext.define('NextThought.controller.Config', {
    extend: 'Ext.app.Controller',

    init: function() {
    	Ext.Ajax.request({
			url: 'config.json',
			async: false,//on purpose
			success: function(r,o) { _AppConfig = Ext.decode(r.responseText); },
			failure: function(r,o) { console.log('failed to load config'); }
		});
    	
        console.log('Initialized Config');
    }
});