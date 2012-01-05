Ext.define('NextThought.view.form.ClassInfoForm', {
	extend:'Ext.form.Panel',
    alias: 'widget.class-info-form',


    requires: [
        'NextThought.model.ClassInfo',
        'NextThought.view.form.SectionInfoForm',
        'Ext.form.field.Text',
        'Ext.form.FieldSet',
        'NextThought.view.form.fields.ShareWithField'
    ],

    border: false,
    autoScroll: true,

    fieldDefaults: {
        labelAlign: 'top',
        labelWidth: 75,
        allowBlank: false
    },

    items: [
        {
            xtype: 'textfield',
            emptyText: 'Class Description',
            allowBlank: false,
            name: 'description',
            padding: 5,
            width: '100%',
            margin: '10px 10px 10px 0px'
        },
        {
            xtype: 'textfield',
            emptyText: 'Provider',
            allowBlank: false,
            name: 'provider',
            padding: 5,
            width: '100%',
            margin: '10px 10px 10px 0px'
        }
        /*
        {
            xtype: 'section-info-form'
        }
        */
    ],


    afterRender: function() {
        this.callParent(arguments);
        this.initValue();
    },


    setValue: function(v) {
        this.value = v;
        this.initValue();
    },


    getValue: function() {
        return this.value;
    },
  

    initValue: function() {
        if (!this.value) return;

        var ci = this.value,
            sections = ci.get('Sections');

        this.down('textfield[name=description]').setValue(ci.get('Description'));
        this.down('textfield[name=provider]').setValue('OU');
        Ext.each(sections, function(si){
            this.add({xtype: 'section-info-form', value:si});
        }, this);
    }

});