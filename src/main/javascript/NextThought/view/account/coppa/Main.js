Ext.define('NextThought.view.account.coppa.Main',{
    extend: 'Ext.container.Container',
    alias: 'widget.coppa-main-view',
    requires: [
    ],

    cls: 'coppa-main-view',

    items: [
        {xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items:[
            {xtype:'container', name: 'realname', layout: 'hbox',
                defaults: {
                    xtype: 'simpletext',
                    flex: 1
                },
                items:[
                    {cls:'firstname input-box', name: 'firstname', placeholder:'First Name'},
                    {cls:'lastname input-box', name: 'lastname', placeholder:'Last Name'}
                ]
            },
            {xtype: 'simpletext', name: 'email', cls: 'input-box', inputType: 'email', placeholder:'Email'},
            {xtype: 'box', autoEl:{tag:'h3', html:'Optional Information'}},
            {xtype: 'checkbox', name: 'opt_in_email_communication', boxLabel:'Send me updates about NextThought.'},
            {xtype: 'box', name:'affiliationBox', autoEl:{tag:'div', cls:'what-school', html:'What school do you attend?'}},
            {
                xtype: 'combobox',
                name: 'affiliation',
                typeAhead: true,
                forceAll: true,
                valueField: 'school',
                displayField: 'school',
                multiSelect: false,
                enableKeyEvents: true,
                queryMode: 'remote',
                cls: 'combo-box',
                anchor: '100%',
                hideTrigger: true,
                listConfig: {
                    ui: 'nt',
                    plain: true,
                    showSeparator: false,
                    shadow: false,
                    frame: false,
                    border: false,
                    cls: 'x-menu',
                    baseCls: 'x-menu',
                    itemCls: 'x-menu-item no-border',
                    emptyText: '<div class="x-menu-item">No results</div>',
                    xhooks: {
                        initComponent: function(){
                            this.callParent(arguments);
                            this.itemSelector = '.x-menu-item';
                        }
                    }
                },
                listeners: {
                    change: function() {
                        var store = this.store;
                        store.suspendEvents();
                        store.clearFilter();
                        store.resumeEvents();
                        store.filter({
                            property: 'school',
                            anyMatch: true,
                            value   : this.getValue()
                        });
                        this.expand();
                    }
                }
            }
        ]},
        {xtype: 'box', hidden: true, name:'error', autoEl: {cls: 'error-box', tag:'div',
            cn:[
                {cls: 'error-field'},
                {cls: 'error-desc'}
            ]}
        },
        {xtype: 'container', cls: 'submit',  layout:{type: 'hbox', pack: 'end'}, items: [
            {xtype: 'button', ui: 'primary', scale: 'medium', name: 'submit', text:'Submit'}
        ]}
    ],

    initComponent: function(){
        this.callParent(arguments);

        //we need to setup the combo box with a store:
        this.store = new Ext.data.ArrayStore({
            storeId: 'schoolStore',
            autoLoad: true,
            fields:[{
                mapping: 0,
                name:'school',
                type:'string'
            }],
            proxy: {
                type: 'ajax',
                url: './resources/misc/school-data.json',
                reader: 'array'
            }
        });

        this.down('combobox').bindStore(this.store);
    },


    setSchema: function(){},


    afterRender: function(){
        this.callParent(arguments);

        var u = $AppConfig.userObject,
            realname = u.get('realname'),
            email = u.get('email'),
            aff = u.get('affiliation'),
            fn, ln;

        fn = (realname.indexOf(' ') > 0) ? realname.substring(0, realname.indexOf(' ')) : realname;
        ln = (realname.indexOf(' ') > 0) ? realname.substring(realname.indexOf(' ')) : null;

        if (fn){this.down('[name=firstname]').update(fn);}
        if (ln){this.down('[name=lastname]').update(ln);}
        if (email){this.down('[name=email]').update(email);}
        if (aff){this.down('[name=affiliation]').setValue(aff);}
        this.down('[name=opt_in_email_communication]').setValue(u.get('opt_in_email_communication'));
    },


    getValues: function(){
        var email = this.down('[name=email]').getValue(),
            firstname = this.down('[name=firstname]').getValue(),
            lastname = this.down('[name=lastname]').getValue(),
            check = this.down('[name=opt_in_email_communication]').checked,
            affiliation = this.down('[name=affiliation]').getValue();

        return {
            email: email,
            firstname: firstname,
            lastname: lastname,
            realname: firstname + ' ' + lastname,
            opt_in_email_communication: check,
            affiliation: affiliation
        };

    },

    setError: function(error) {
        var box = this.down('[name=error]'),
            field = this.down('[name='+error.field+']'),
            allFields = this.query('[name]');

        //clear all errors:
        Ext.each(allFields, function(f){f.removeCls('error');});

        //make main error field show up
        box.el.down('.error-field').update(error.field);
        box.el.down('.error-desc').update(error.message);
        box.show();

        //set error state on specific field
        field.addCls('error');

        this.up('window').updateLayout();
    }
});
