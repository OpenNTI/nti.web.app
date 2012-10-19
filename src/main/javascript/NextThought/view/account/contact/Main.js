Ext.define('NextThought.view.account.contact.Main',{
    extend: 'Ext.container.Container',
    alias: 'widget.contact-main-view',
    requires: [
        'Ext.form.field.TextArea'
    ],

    cls: 'contact-main-view',

    items: [
        {xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items:[
            {xtype: 'simpletext', name: 'email', cls: 'input-box', inputType: 'email', placeholder:'Email'},
            {xtype: 'textarea', name: 'message', cls: 'input-box textarea', emptyText: 'Your message...'}
        ]},
        {xtype: 'box', hidden: true, name:'error', autoEl: {cls: 'error-box', tag:'div',
            cn:[
                {cls: 'error-field'},
                {cls: 'error-desc'}
            ]}
        },
        {xtype: 'container', cls: 'submit',  layout:{type: 'hbox', pack: 'end'}, items: [
            {xtype: 'button', ui: 'secondary', scale: 'large', name: 'cancel', text:'Cancel', handler: function(b){
                b.up('window').close();
            }},
            {xtype: 'button', ui: 'primary', scale: 'large', name: 'submit', text:'Submit'}
        ]}
    ],

    afterRender: function(){
        this.callParent(arguments);

        var u = $AppConfig.userObject,
            email = u.get('email'),
            eField = this.down('[name=email]');
        if (email){
            eField.update(email);
            eField.addCls('valid');
        }
    },


    getValues: function(){
        var email = this.down('[name=email]').getValue(),
            message = this.down('[name=message]').getValue();

        return {
            //email: email,
            email: email,
            message: message
        };

    },

    setError: function(error) {
        var box = this.down('[name=error]'),
            field = this.down('[name='+error.field+']'),
            allFields = this.query('[name]');

        //clear all errors:
        Ext.each(allFields, function(f){f.removeCls('error');});

        //make main error field show up
	    box.el.down('.error-field').update(error.field.replace('_',' '));
        box.el.down('.error-desc').update(error.message);
        box.show();

        //set error state on specific field
        field.addCls('error');

        this.up('window').updateLayout();
    }
});
