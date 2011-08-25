


Ext.define('NextThought.view.LoginWindow', {
	extend: 'Ext.window.Window',
	alias : 'widget.loginwindow',
	
	title: 'Login', 
	width: 400, 
//	height: 150,
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
    	this.items = [
            {
            	xtype:'form',
		        border: 0,
		        bodyPadding: 5,
		
		        fieldDefaults: {
		            labelWidth: 55,
		            anchor: '100%'
		        },
		
//		        layout: {
//		            type: 'vbox',
//		            align: 'stretch'
//		        },

                layout: 'anchor',
                defaults: {
                    anchor: '100%',
                    allowBlank: false
                },
		
		        items: [
                    {
                        name: 'login-message',
                        cls: 'x-login-message-box',
                        border: false,
                        html: 'Please enter your login information:'
                    },{
			            xtype: 'textfield',
			            emptyText: 'email@address.com',
			            fieldLabel: 'Username',
			            name: 'username'
			            //vtype: 'email'
		        	},{
			            xtype: 'textfield',
			            emptyText: 'password',
			            inputType: 'password',
			            fieldLabel: 'Password',
			            name: 'password'
		        	},{
			            xtype: 'checkboxfield',
                        margin: '0 0 0 60px',
			            boxLabel: 'Keep me logged in on this computer',
			            name: 'remember'
		        	}
		        ]
		    }
        ];
    	
   		this.callParent(arguments);
    },

    render: function(){
        this.callParent(arguments);
        this.down('textfield[name=username]').inputEl.dom.autocomplete = 'on';
        this.down('textfield[name=password]').inputEl.dom.autocomplete = 'on';
    },
    
    show: function(){
    	this.callParent(arguments);
    	this.down('textfield').focus();
    }
    
});