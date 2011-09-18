Ext.define('NextThought.view.windows.LoginWindow', {
    extend: 'Ext.window.Window',
    alias : 'widget.loginwindow',
	
    title: 'Login',
    width: 500,
    resizable: false,
    closable: false,
    layout: 'anchor',

    items: [{
        xtype:'form',
        border: 0,
        bodyPadding: 5,
        anchor: '100%',

        fieldDefaults: {
            labelWidth: 60,
            margin: 15,
            allowBlank: false,
            anchor: '100%',
            labelAlign: 'top'
        },
        layout: 'anchor',

        items: [{
            name: 'login-message',
            cls: 'x-login-message-box',
            border: false,
            html: 'Please enter your login information:'
        },{
            xtype: 'textfield',
            cls: 'x-login-form-username',
            emptyText: 'email@address.com',
            fieldLabel: 'Username',
            name: 'username',
            vtype: 'email'
        },{
            xtype: 'textfield',
            cls: 'x-login-form-password',
            emptyText: 'password',
            inputType: 'password',
            fieldLabel: 'Password',
            name: 'password',
            margin: '15px 15px 15px 80px',
            listeners: {
                specialkey: function(field, e){
                    if (e.getKey() == e.ENTER) {
                        var btn = field.up('window').down('button[actionName=login]');
                        btn.fireEvent('click', btn, e);
                    }
                }
            }
        },{
            xtype: 'checkboxfield',
            margin: '15px 15px 15px 80px',
            boxLabel: 'Keep me logged in on this computer',
            name: 'remember'
        }]
    }],
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

    constructor: function(){
        this.addEvents('initialized');
        this.callParent(arguments);

    },

    initComponent: function(){
        this.callParent(arguments);
        this._username = this.down('textfield[name=username]');
        this._password = this.down('textfield[name=password]');
        this._remember = this.down('checkboxfield');
        this.fireEvent('initialized', this);
    },

    render: function(){
        this.callParent(arguments);
        this._username.inputEl.dom.autocomplete = 'on';
        this._password.inputEl.dom.autocomplete = 'on';
    },
    
    show: function(){
        this.callParent(arguments);
        var un = this._username,
            pw = this._password;

        if(un.getValue()) pw.focus();
        else un.focus();
    },


    setUsername: function(name){
        this._username.setValue(name);
        this._username.originalValue = name;
    },

    setRemember: function(flag){
        this._remember.setValue(flag!==false);
        this._remember.originalValue = flag!==false;
    }

});