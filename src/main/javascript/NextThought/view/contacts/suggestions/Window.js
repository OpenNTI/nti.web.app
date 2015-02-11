Ext.define('NextThought.view.contacts.suggestions.Window', {
    extend: 'NextThought.view.window.Window',
    alias: 'widget.suggest-contacts-window',
    requires: [
        'NextThought.view.contacts.suggestions.Main'
    ],

    cls: 'suggest-window codecreation-window',
    ui: 'nt-window',
    minimizable: false,
    constrain: true,
    modal: true,
    closable: true,
    resizable: false,
    dialog: true,
    closeAction: 'destroy',

    width: 640,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items:[
        {xtype: 'component', renderTpl: Ext.DomHelper.markup([
            {cls: 'title', html: '{{{NextThought.view.contacts.suggestions.window.title}}}'}
        ])},
        {xtype: 'suggest-contacts-view'}
    ]
});