Ext.define('NextThought.view.windows.ClassCreateEditWindow', {
	extend: 'Ext.window.Window',
	alias : 'widget.class-create-edit-window',

    requires: [
        'NextThought.view.form.ClassInfoForm'
    ],

    width: 700,
    height: 350,
    maximizable:true,
    constrain: true,
    autoScroll: true,
    title: 'Class Editor',
    cls: 'class-create-edit-window',

    items:
    {
        xtype: 'class-info-form'
    },

    dockedItems: {
        dock: 'bottom',
        xtype: 'toolbar',
        items: [
            {text: 'Add Section'}
        ]
    }

});