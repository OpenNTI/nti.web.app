Ext.define('NextThought.view.account.recovery.Window',{
    extend: 'NextThought.view.Window',
    alias: 'widget.recovery-email-window',

    requires: [
        'NextThought.view.account.recovery.Email',
        'NextThought.view.account.coppa.Header'
    ],

    cls: 'recovery-email-window',
    ui: 'nt-window',
    minimizable: false,
    constrain: true,
    modal: true,
    closable: false,
    resizable: false,
    dialog: true,

    width: 480,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [
        {
            xtype: 'coppa-header-view',
            title: 'Email Bounce Notification',
            detail:'The email you supplied is not valid, please reset your email now.',
            icon: 'alert'
        }
    ],


    initComponent: function() {
        this.callParent(arguments);
        this.add({xtype: 'recovery-email-view', fieldName: this.fieldName, linkName: this.linkName});
    } ,


    afterRender: function(){
        this.callParent(arguments);

        if ( this.linkName.indexOf('-contact-') > 0) {
            //is contact email
            Ext.fly(this.down('coppa-header-view').el.query('.title')[0]).setHTML('Invalid Parent Email...');
            Ext.fly(this.down('coppa-header-view').el.query('.detail')[0]).setHTML('Please provide your parent\'s email address to get permission for social features.') ;
        }
        else {
            //regulat email
            Ext.fly(this.down('coppa-header-view').el.query('.title')[0]).setHTML('Invalid Email...');
            Ext.fly(this.down('coppa-header-view').el.query('.detail')[0]).setHTML('We couldn\'t deliver your email. Please enter a valid email address.') ;
        }
    }
});
