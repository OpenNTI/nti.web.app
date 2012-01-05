Ext.define('NextThought.view.form.SectionInfoForm', {
	extend:'Ext.form.Panel',
    alias: 'widget.section-info-form',

    requires: [
        'NextThought.model.SectionInfo',
        'Ext.form.field.Text',
        'Ext.form.FieldSet',
        'NextThought.view.form.fields.ShareWithField'
    ],

    border: false,
    collapsible: true,
    collapsed: true,

    defaults: {
        padding: 5
    },

    items: [
        {
            xtype: 'textfield',
            emptyText: 'Section Description',
            allowBlank: false,
            name: 'description',
            width: '100%',
            margin: '10px 10px 10px 0px'
        },
        {
            xtype: 'datefield',
            fieldLabel: 'Section Open',
            name: 'openDate'
        },
        {
            xtype: 'datefield',
            fieldLabel: 'Section Closed',
            name: 'closeDate'
        },
        {
            margin: '10px 5px',
            allowBlank: false,
            emptyText: 'Instructors...',
            xtype: 'sharewith',
            name: 'instructors'
        },
        {
            margin: '10px 5px',
            allowBlank: false,
            emptyText: 'Enrolled...',
            xtype: 'sharewith',
            name: 'enrolled'
        }
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
        var si = this.value,
            od = si.get('OpenDate'),
            cd = si.get('CloseDate'),
            d = si.get('Description'),
            e = si.get('Enrolled'),
            i = si.get('InstructorInfo').get('Instructors'),
            p = si.get('Provider');

        this.down('textfield[name=description]').setValue(d);
        this.down('datefield[name=openDate]').setValue(od);
        this.down('datefield[name=closeDate]').setValue(cd);
        this.down('sharewith[name=enrolled]').setValue(e);
        this.down('sharewith[name=instructors]').setValue(i);
    }
});