


Ext.define('NextThought.view.LoginWindow', {
	extend: 'Ext.window.Window',
	alias : 'widget.loginwindow',
	
	title: 'Login', 
	width: 400, 
	height: 150, 
	// modal: true, 
	resizable: false,
	closable: false,
	layout: 'fit',
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        layout: { pack: 'center' },
        items: [{
            minWidth: 80,
            text: 'Login',
            actionName: 'login'
        },{
            minWidth: 80,
            text: 'Cancel',
            actionName: 'cancel'
        }]
    }],
	
    initComponent: function(){
    	var u = _AppConfig.server.username,
    		p = _AppConfig.server.password;
    	this.items = [
            {
            	xtype:'form',
		        border: 0,
		        bodyPadding: 5,
		
		        fieldDefaults: {
		            labelWidth: 55,
		            anchor: '100%'
		        },
		
		        layout: {
		            type: 'vbox',
		            align: 'stretch'
		        },
		
		        items: [
		        	{
			            xtype: 'textfield',
			            emptyText: 'email@address.com',
			            fieldLabel: 'Username',
			            name: 'username',
			            allowBlank: false,
			            // vtype: 'email',
			            value: (u!='ask'?u:undefined)
		        	},{
			            xtype: 'textfield',
			            emptyText: 'password',
			            inputType: 'password',
			            fieldLabel: 'Password',
			            name: 'password',
			            allowBlank: false,
			            value: (p!='ask'?p:undefined)
		        	}
		        ]
		    }
        ];
    	
   		this.callParent(arguments);
    },
    
    
    show: function(){
    	this.callParent(arguments);
    	this.down('textfield').focus();
    }
    
});