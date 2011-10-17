Ext.define('NextThought.view.windows.LoginWindow', {
    extend: 'Ext.container.Viewport',
    alias : 'widget.loginwindow',
    requires: [
        'Ext.Img',
        'Ext.form.field.Text',
        'Ext.form.field.Checkbox'
    ],

    autoRender: false,
    autoShow: false,
    border: false,
    layout: 'border',
    items: [
        {
            cls: 'x-brand-and-search-bar',
            region: 'north',
            html: Ext.String.format(
                '<img src="{0}" class="header-logo" alt="banner" width="180" height="60" />',
                Ext.BLANK_IMAGE_URL),
            border: false,
            height: 60
        },
        {
            region: 'center',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            tbar: { xtype: 'toolbar', cls: 'x-docked-noborder-top', items: {focusable: false, disabled:true,text:'&nbsp;'}},
            items: [
                {
                    flex: 1, border: false
                },{
                    width: CENTER_WIDTH,
                    autoScroll: true,
                    layout: 'anchor',
                    border: false,
                    cls: 'x-login-form-box',
                    items: [
                        {
                            xtype:'form',
                            border: false,
                            anchor: '100%',
                            fieldDefaults: {
                                labelWidth: 60,
                                margin: 15,
                                allowBlank: false,
                                anchor: '80%',
                                labelAlign: 'top'
                            },
                            layout: 'anchor',
                            items: [
                                {
                                    name: 'login-message',
                                    cls: 'x-login-message-box',
                                    border: false,
                                    html: 'Please enter your login information:'
                                },{
                                    border: false,
                                    layout: 'hbox',
                                    items:[{
                                        xtype: 'box',
                                        width: 128,
                                        border: false,
                                        html: Ext.String.format(
                                            '<img src="{0}" class="login-icon" alt="login" width="128" height="128" />',
                                            Ext.BLANK_IMAGE_URL)
                                    },{
                                        border: false,
                                        flex: 1,
                                        layout: 'anchor',
                                        items:[
                                            {
                                                xtype: 'textfield',
                                                cls: 'x-login-form-username',
                                                //margin: '15px 15px 15px 140px',
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
                                                //margin: '15px 15px 15px 140px',
                                                listeners: {
                                                    specialkey: function(field, e){
                                                        if (e.getKey() == e.ENTER) {
                                                            var btn = field.up('loginwindow').down('button[actionName=login]');
                                                            btn.fireEvent('click', btn, e);
                                                        }
                                                    }
                                                }
                                            },{
                                                xtype: 'checkboxfield',
                                                //margin: '15px 15px 15px 80px',
                                                boxLabel: 'Keep me logged in on this computer',
                                                name: 'remember'
                                            },{
                                                xtype: 'panel',
                                                border: false,
                                                items: [
                                                    {
                                                        margin: 15,
                                                        xtype: 'button',
                                                        width: 80,
                                                        text: 'Login',
                                                        actionName: 'login'
                                                    },
                                                    {
                                                        xtype:'box',
                                                        autoEl:{tag: 'a', href: '#', html: 'About'}
                                                    }
                                                ]
                                            }
                                        ]
                                    }]
                                }
                            ]
                        }]
                },{
                    flex: 1, border: false
                }
            ]
        }
    ],

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


    destroy: function(){
        var el = this.el.down('.x-box-inner');
        Ext.EventManager.removeResizeListener(this.fireResize, this);
        this.callParent(arguments);
        if(el){
            el.remove();
        }
    },


    close: function(){
        this.destroy();
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
