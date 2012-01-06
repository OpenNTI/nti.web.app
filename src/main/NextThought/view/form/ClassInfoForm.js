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
            name: 'Description',
            padding: 5,
            width: '100%',
            margin: '10px 10px 10px 0px'
        },
        {
            xtype: 'section-info-form',
            name: 'Sections'
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
        var r, sections = [];

        //Turn all section values into their json objects
        Ext.each(this.getSections(), function(s){
            sections.push(s.getValue().toJSON());
        }, this);


        r = Ext.create('NextThought.model.ClassInfo', this.value.toJSON());
        r.set('Description', this.down('textfield[name=Description]').getValue());
        r.set('Sections', sections);
        return r;
    },


    initValue: function() {
        if (!this.value) return;

        this.loadRecord(this.value);

        var ci = this.value,
            sections = ci.get('Sections') || [],
            existingSections = this.getSections();

        //populate the section infos, after first clearing any previously existing ones
        Ext.each(existingSections, function(s){this.remove(s);}, this);
        Ext.each(sections, function(si){
            this.add({xtype: 'section-info-form', value:si});
        }, this);
    },

    addEmptySection: function() {
        this.add({xtype: 'section-info-form'});
    },

    getSections: function() {
        return Ext.ComponentQuery.query('section-info-form');
    }

});