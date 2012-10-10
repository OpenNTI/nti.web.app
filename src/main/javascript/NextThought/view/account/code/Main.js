Ext.define('NextThought.view.account.code.Main',{
    extend: 'Ext.container.Container',
    alias: 'widget.code-main-view',
    requires: [
    ],

    cls: 'code-main-view',

    items: [
        {xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items:[
            {xtype: 'simpletext', name: 'code', cls: 'input-box', inputType: 'text', placeholder:'Enter Code'}
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

    getValue: function(){
        var code = this.down('[name=code]').getValue();

        return {
            code: code
        };

    },

    setError: function(error) {
        var box = this.down('[name=error]'),
            field = this.down('[name=code]'),
            allFields = this.query('[name]');

        //clear all errors:
        Ext.each(allFields, function(f){f.removeCls('error')});

        //make main error field show up
        box.el.down('.error-field').update(error.field);
        box.el.down('.error-desc').update(error.message);
        box.show();

        //set error state on specific field
        field.addCls('error');

        this.up('window').updateLayout();
    }
});
