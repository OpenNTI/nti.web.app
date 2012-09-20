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
			placeholder: 'Current',
			allowBlank: false
        },{
            xtype: 'simpletext',
            name: 'password',
            placeholder: 'New',
            inputType: 'password',
			allowBlank: false,
			minLength: 5
        }, {
            xtype: 'simpletext',
            name: 'password-verify',
            placeholder: 'Confirm New',
            inputType: 'password',
			allowBlank: false,
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
				{text: 'Cancel', ui: 'text', handler: function(b){b.up('password-reset-form').reset();} },
				{text: 'Save', save:1, ui: 'primary', scale: 'medium', disabled: true }
			]
		}
    ],


	reset: function(){
		Ext.each(this.inputs,function(o){o.clearValue();});
		this.down('button[save]').disable();
	},


	getValues: function(){
		return {
			old_password: this.down('[name=old_password]').getValue(),
			password: this.down('[name=password]').getValue()
		};
	},

	afterRender: function(){
		this.callParent(arguments);

		this.inputs = this.query('simpletext');
		Ext.each(this.inputs,function(i){
			this.mon(i,'changed',this.checkValidity,this,{buffer: 500});
		},this);
	},


	checkValidity: function(value, input){
		input.validate();

		var v = this.inputs.reduce(function(accum,o){ return accum && o.validate(true); }, true);
		this.down('button[save]')[v?'enable':'disable']();
	}
});
