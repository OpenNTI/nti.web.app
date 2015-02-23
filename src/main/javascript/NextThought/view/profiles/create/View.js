Ext.define('NextThought.view.profiles.create.View', {
    extend: 'Ext.Component',
    alias: 'widget.profile-create-view',

    requires: [
        'NextThought.view.profiles.About',
    ],


    mixins: {
        EditingUser: 'NextThought.view.profiles.mixins.EditUserMixin'
    },

    layout: 'auto',

    renderTpl: Ext.DomHelper.markup([
        {
            cls: 'fold', cn: [

            { cls: 'field', cn: [
                { cls: 'label', html: '{{{NextThought.view.profiles.About.name}}}' },
                { cn: { tag: 'input', 'data-field': 'username', value: '{name}', class:'locked', 'placeholder': '{{{NextThought.view.profiles.About.name}}}' } },
                { cls: 'error-msg', 'data-prop': 'username'}
            ]},

            { cls: 'field', cn: [
                { cls: 'label', html: '{{{NextThought.view.profiles.About.location}}}' },
                { cn: { tag: 'input', 'data-field': 'location', value: '{location}', 'placeholder': '{{{NextThought.view.profiles.About.location}}}' } },
                { cls: 'error-msg', 'data-prop': 'location'}
            ]},

            { cls: 'field', cn: [
                { cls: 'label', cn: { tag: 'span', 'data-field': 'affiliation', 'placeholder': '{{{NextThought.view.profiles.About.affiliation}}}' } },
                { cn: { tag: 'input', 'data-field': 'affiliation', value: '{affiliation}', 'placeholder': '{{{NextThought.view.profiles.About.affiliation}}}' } },
                { cls: 'error-msg', 'data-prop': 'affiliation'}
            ]},

            { cls: 'field', cn: [
                { cls: 'label', cn: { tag: 'span', 'data-field': 'role', 'data-placeholder': '{{{NextThought.view.profiles.About.role}}}' } },
                { cn: { tag: 'input', 'data-field': 'role', value: '{role}', 'placeholder': '{{{NextThought.view.profiles.About.role}}}' } },
                { cls: 'error-msg', 'data-prop': 'role'}
            ]},

            { cls: 'field', cn: [
                { cls: 'label', cn: { tag: 'span', 'data-field': 'about', 'data-placeholder': '{{{NextThought.view.profiles.About.write}}}' } },
                { cn: { tag: 'textarea', 'data-field': 'about', value: '{about}', 'placeholder': '{{{NextThought.view.profiles.About.write}}}' } },
                { cls: 'error-msg', 'data-prop': 'about'}
            ]}
        ]},
        { cls: 'error-msg' }
    ]),


    renderSelectors: {
        pictureEl: '.picture-container',
        nameEl: '.field input [data-field=name]',
        locationEl: '.field input [data-field=location]',
        affiliationEl: '.field input [data-field=affiliation]',
        roleEl: '.field input [data-field=role]',
        aboutEl: '.field [data-field=about]'
    },


    initComponent: function(){
        this.callParent(arguments);

        this.on({
            'save-edits': 'onSaveEdits',
            'cancel-edits': 'onCancelEdits'
        });
    },


    beforeRender: function(){
        this.callParent(arguments);

        this.renderData = Ext.applyIf(this.renderData || {}, {
            'name': this.user && this.user.getName(),
            'location': this.user && this.user.get('location'),
            'affiliation': this.user && this.user.get('affiliation'),
            'role': this.user && this.user.get('role')
        });
    },


    getEditableFields: function(){
        return this.el && this.el.query('[data-field]:not(.locked)');
    },


    getValueForField: function(field){
        var text = field && field.value;

        return Ext.isEmpty(text) ? null : text;
    }
});