Ext.define('NextThought.view.account.recovery.Email',{
    extend: 'Ext.container.Container',
    alias: 'widget.recovery-email-view',
    requires: [
    ],

    cls: 'recovery-email-view',

    items: [
        {xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items:[
            {xtype: 'simpletext', name: 'email', cls: 'input-box', inputType: 'email', placeholder:'Email'}
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


    getValue: function(){
        return {
            email: this.down('[name=email]').getValue(),
            fieldName: this.fieldName,
            linkName: this.linkName
        };
    },


    setError: function(error) {
        var box = this.down('[name=error]'),
            field = this.down('[name='+error.field+']');

        //make main error field show up
        box.el.down('.error-field').update(error.field),
            box.el.down('.error-desc').update(error.message),
            box.show();

        //set error state on specific field
        field.addCls('error');

        this.up('window').updateLayout();
    }
});