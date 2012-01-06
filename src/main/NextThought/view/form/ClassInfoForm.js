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
            xtype: 'fieldset',
            title: 'Sections',
            sections: true
        }
    ],


    afterRender: function() {
        this.callParent(arguments);

        //add plus button to the sections fieldset for adding new sections
        this.down('fieldset[sections]').legend.insert(0, this.createAddSectionTool());

        this.initValue();
    },


    createAddSectionTool: function() {
        var me = this,
            cmp;

        cmp = Ext.create('Ext.panel.Tool', {
            getElConfig: function() {
                return {
                    tag: Ext.isGecko3 ? 'span' : 'div',
                    id: cmp.id,
                    cls: cmp.cls
                };
            },
            type: 'plus',
            handler: function(){me.addSection();},
            scope: me
        });
        me.addSectionTool = cmp;
        return cmp;
    },

    setValue: function(v) {
        this.value = v;
        this.initValue();
    },


    getValue: function() {
        var r, sections = [],
            v = this.value ? this.value.toJSON() : undefined;

        //Turn all section values into their json objects
        Ext.each(this.getSections(), function(s){
            sections.push(s.getValue().toJSON());
        }, this);


        r = Ext.create('NextThought.model.ClassInfo', v);
        r.set('Description', this.down('textfield[name=Description]').getValue());
        r.set('Sections', sections);
        return r;
    },


    initValue: function() {
        if (!this.value) return;

        this.loadRecord(this.value);

        var ci = this.value,
            sections = ci.get('Sections') || [];

        //populate the section infos, after first clearing any previously existing ones
        this.down('fieldset[sections]').removeAll(true);
        Ext.each(sections, function(si){
            this.addSection(si, !this.value.isModifiable());
        }, this);

        if (!this.value.isModifiable()) {
            Ext.each(this.query('field'), function(f){f.setReadOnly(true);});
            this.addSectionTool.hide();
        }
    },

    /**
     *
     * @param [v], a value if you want the section populated
     * @param [readOnly] tell the sections to be read only
     */
    addSection: function(v, readOnly) {
        this.down('fieldset[sections]').add({xtype: 'section-info-form', value:v, readOnly:readOnly});
    },

    getSections: function() {
        return this.query('section-info-form');
    }

});