Ext.define('NextThought.view.form.PasswordResetForm', {
    extend:'Ext.form.Panel',
    alias: 'widget.password-reset-form',

    requires: [
        'Ext.form.field.Text',
        'Ext.form.FieldSet'
    ],

    ui: 'account',

    defaults: {
        margin: '5px'
    },

    items: [
        {
            xtype: 'textfield',
            name: 'old_password',
            fieldLabel: 'Current Password',
            inputType: 'password',
            allowBlank: false,
            minLength: 1
        },{
            xtype: 'textfield',
            name: 'password',
            fieldLabel: 'New Password',
            inputType: 'password',
            allowBlank: false,
            minLength: 1,
            validator: function(value) {
                var oldpw = this.previousSibling('[name=old_password]').getValue(),
                    sim = this.up('window').down('account-form').similarity;
                if (value.length < 6) { return 'Password too short'; }
                else if (sim(oldpw,value) > 0.6) { return 'New password too similar'; }
                else { return true; }
            }
        }, {
            xtype: 'textfield',
            name: 'password-verify',
            fieldLabel: 'Verify Password',
            inputType: 'password',
            allowBlank: false,
            validator: function(value) {
                var password = this.previousSibling('[name=password]').getValue();
                return (value === password) ? true : 'Passwords do not match.';
            }        }
    ]
});
