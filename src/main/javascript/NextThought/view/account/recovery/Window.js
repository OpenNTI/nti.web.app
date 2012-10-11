Ext.define('NextThought.view.account.recovery.Window',{
    extend: 'NextThought.view.Window',
    alias: 'widget.recovery-email-window',

    requires: [
        'NextThought.view.account.recovery.Email',
        'NextThought.view.account.Header'
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
            xtype: 'account-header-view',
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

        var headerView = this.down('account-header-view'),
            emailView = this.down('recovery-email-view');

        if ( this.linkName === 'state-bounced-contact-email') {
            //is contact email, not cancelable
            Ext.fly(headerView.el.query('.title')[0]).setHTML('Resend Consent Form...');
            Ext.fly(headerView.el.query('.detail')[0]).setHTML('We couldn\'t deliver the form to the email address you provided. Please enter your parent\'s email to get permission for social features.');
            emailView.down('button[name=cancel]').destroy();
        }
        else if (this.linkName === 'contact-email-sends-consent-request'){
            //is request to resent consent email and enter a new consent email
            Ext.fly(headerView.el.query('.title')[0]).setHTML('Resend Consent Form...');
            Ext.fly(headerView.el.query('.detail')[0]).setHTML('Please enter your parent\'s email to get permission for social features.');
        }
        else {
            //regular email, not cancelable
            Ext.fly(headerView.el.query('.title')[0]).setHTML('Invalid Email...');
            Ext.fly(headerView.el.query('.detail')[0]).setHTML('We couldn\'t deliver your email. Please enter a valid email address.');
            emailView.down('button[name=cancel]').destroy();
        }
    }
});
