Ext.define('NextThought.view.account.contact.Window',{
    extend: 'NextThought.view.Window',
    alias: 'widget.contact-us-window',

    requires: [
        'NextThought.view.account.Header',
        'NextThought.view.account.contact.Main'
    ],

    cls: 'contact-us-window',
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
            title: 'Contact Us...',
            detail: 'Please use the form below to share your comments, report an issue, or suggest new features.  If you need help or have a question about the features, please take a look at the NextThought Help Center.  We may already have content there to help you.'
        },
        {xtype: 'contact-main-view'}
    ]
});
