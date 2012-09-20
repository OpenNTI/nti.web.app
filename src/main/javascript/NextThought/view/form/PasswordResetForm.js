Ext.define('NextThought.view.form.PasswordResetForm', {
    extend:'Ext.container.Container',
    alias: 'widget.password-reset-form',

    requires: [
        'NextThought.view.form.fields.SimpleTextField'
    ],

	cls: 'reset-password',
    ui: 'account',

	layout: {
		type: 'vbox',
		align: 'stretch'

	},

    items: [
        {
            xtype: 'simpletext',
            name: 'old_password',
            inputType: 'password',
			placeholder: 'Current'
        },{
            xtype: 'simpletext',
            name: 'password',
            placeholder: 'New',
            inputType: 'password'
        }, {
            xtype: 'simpletext',
            name: 'password-verify',
            placeholder: 'Confirm New',
            inputType: 'password',
            validator: function(value) {
                var password = this.previousSibling('[name=password]').getValue();
                return (value === password) ? true : 'Passwords do not match.';
            }
		}, {
			xtype: 'container',
			layout: {
				type: 'hbox',
				pack: 'end',
				align: 'middle'
			},
			defaultType: 'button',
			items: [
				{text: 'Cancel', ui: 'text' },
				{text: 'Save', ui: 'primary', scale: 'medium', disabled: true }
			]
		}
    ]
});
