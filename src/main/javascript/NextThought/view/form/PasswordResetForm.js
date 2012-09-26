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

	items: [{
		xtype: 'container',
		layout: {
			type: 'hbox',
			align: 'stretch'
		},
		items:[{
			xtype: 'container',
			flex: 1,
			defaults: {
				cls: 'password-box',
				inputType: 'password',
				xtype: 'simpletext',
				allowBlank: false
			},
			items: [
				{
					name: 'old_password',
					placeholder: 'Old Password'
				},{
					name: 'password',
					placeholder: 'New Password',
					minLength: 5
				}, {
					name: 'password-verify',
					placeholder: 'Verify New Password',
					validator: function(value) {
						var password = this.previousSibling('[name=password]').getValue();
						if (value === password) {
							return true;
						}
						throw 'Passwords do not match.';
					}
				}]
		},{
			flex: 1,
			xtype: 'box',
			message:1,
			cls: 'message-box',
			autoEl: {
				cn:[{cls:'text'}]
			}
		}]
	}, {
		xtype: 'container',
		cls: 'footer',
		layout: {
			type: 'hbox',
			pack: 'end',
			align: 'middle'
		},
		defaultType: 'button',
		items: [
			{text: 'Save Password', save:1, ui: 'flat-blue', scale: 'medium', disabled: true }
		]
	}],


	setMessage: function(msg,error){
		var el = this.down('box[message]').getEl().down('.text');
		el[error?'addCls':'removeCls']('error');
		el.update(msg||'');
	},

	setError: function(errorJson){
		this.setMessage(errorJson.message,true);
	},


	setSuccess: function(){
		this.setMessage('You\'re password has\nbeen changed.');
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

		function val(i,s){
			try {
				return i.validate(!!s);
			}
			catch(msg){
				input.setError();
				me.setError({message: msg});
			}
			return false;
		}

		var me = this,
			v = false;

		if( val(input) ){
			me.setMessage();
			v = me.inputs.reduce( function(accum,o){ return accum && val(o,true); }, true);
		}

		me.down('button[save]')[v?'enable':'disable']();
		me.updateLayout();
	}
});
