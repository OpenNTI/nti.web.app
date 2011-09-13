Ext.define('NextThought.view.form.AccountForm', {
	extend:'Ext.form.Panel',
    alias: 'widget.account-form',

    requires: [
        'NextThought.view.form.fields.ShareWithField'
    ],

    border: false,
    bodyPadding: 5,
    autoScroll: true,

    fieldDefaults: {
        labelAlign: 'top',
        labelWidth: 75,
        anchor: '100%',
        allowBlank: false
    },

    layout: 'anchor',
    defaults: {
        layout: 'anchor',
        anchor: '100%',
        border: false,
        padding: 5,
        defaults: {
            layout: 'anchor',
            padding: 5,
            anchor: '100%',
            border: false
        }
    },

    items: [
        {
            layout: 'hbox',
            items: [
                {
                    xtype: 'box',
                    autoEl: {tag: 'img'},
                    width: 64,
                    height: 64,
                    name: 'avatar'
                },
                {
                    flex: 1,
                    //layout: 'anchor',
                    items:[
                        {
                            //fieldLabel: 'Real Name',
                            cls: 'x-real-name-field',
                            xtype: 'textfield',
                            emptyText: 'Real name',
                            name: 'realname'
                        },
                        {
                            xtype: 'textfield',
                            emptyText: 'Alias',
                            name: 'alias',
                            fieldLabel: 'Alias',
                            padding: 0,
                            margin: '10px 0px',
                            anchor: '50%'
                        },
                        {
                            margin: '20px 0px',
                            xtype: 'box',
                            autoEl: {tag: 'a', href: '#', html: 'Change password', style: 'display: block'}
                        },
                        {
                            border: false,
                            margin: '10px 0px',
                            defaults: {
                                padding: 0,
                                margin: '10px 0px',
                                anchor: '100%',
                                layout: 'anchor',
                                xtype:'fieldset',
                                collapsible: true,
                                collapsed: true,
                                border: false,
                                defaults: {
                                    padding: 0,
                                    margin: '10px 5px',
                                    anchor: '100%',
                                    layout: 'anchor',
                                    border: false,
                                    emptyText: 'Search to add...',
                                    xtype: 'sharewith'
                                }
                            },
                            items:[
                                { title: 'Following',   items: { name: 'following'  }, collapsed: false },
                                { title: 'Communities', items: { name: 'Communities', readOnly: true } },
                                { title: 'Accepting',   items: { name: 'accepting'  } },
                                { title: 'Ignoring',    items: { name: 'ignoring'   } }
                            ]
                        }
                    ]
                }
            ]
        }


    ],


    initComponent: function(){
        this.callParent(arguments);
    },

    afterRender: function(){
        this.callParent(arguments);
        this.down('component[name=avatar]').el.dom.src = this.account.get('avatarURL');

        this.setFieldValue('realname');
        this.setFieldValue('alias');
        this.setFieldValue('accepting');
        this.setFieldValue('following');
        this.setFieldValue('ignoring');
        this.setFieldValue('Communities');

        Ext.each(this.query('fieldset'), this.__setupAccordion, this);

    },

    __setupAccordion: function(g,i,groups){
        g.oldSetExpanded = g.setExpanded;
        g.setExpanded = function(exp){
            if(exp)Ext.each(groups, function(g){g.collapse()});
            this.oldSetExpanded(exp);
        };
    },

    setFieldValue: function(fieldName){
        var rn = this.down('*[name='+fieldName+']');
        rn.setValue(this.account.get(fieldName));
        rn.resetOriginalValue();
    }

});