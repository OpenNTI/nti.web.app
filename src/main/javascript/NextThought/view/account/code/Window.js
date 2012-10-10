Ext.define('NextThought.view.account.code.Window',{
    extend: 'NextThought.view.Window',
    alias: 'widget.code-window',

    requires: [
        'NextThought.view.account.Header',
        'NextThought.view.account.code.Main'
    ],

    cls: 'code-window',
    ui: 'nt-window',
    minimizable: false,
    constrain: true,
    modal: true,
    closable: true,
    resizable: false,
    dialog: true,
    closeAction: 'destroy',

    width: 480,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [
        {
            xtype: 'account-header-view',
            noIcon: true,
            title: 'Enter a Code...',
            detail: 'Enter a code below to join groups.'
        },
        {xtype: 'code-main-view'}
    ]
});
