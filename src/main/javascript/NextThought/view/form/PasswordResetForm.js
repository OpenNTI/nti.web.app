Ext.define('NextThought.view.form.PasswordResetForm', {
  extend: 'Ext.container.Container',
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
		items: [{
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
					placeholder: getString('NextThought.view.form.PasswordResetForm.oldplaceholder'),
					allowBlank: true,
					validator: function(value) {
						if (Ext.isEmpty(value)) {
							throw getString('NextThought.view.form.PasswordResetForm.emptyold');
						}
						return true;
					}
				},{
					name: 'password',
					placeholder: getString('NextThought.view.form.PasswordResetForm.newplaceholder'),
					//minLength: 6, // validator doesn't get called if this is set, and the value is less than
					validator: function(value) {
						if (Ext.isEmpty(value)) {
							throw getString('NextThought.view.form.PasswordResetForm.emptynew');
						}
						if (!Ext.String.trim(value)) {
							throw getString('NextThought.view.form.PasswordResetForm.whitespace');
						}
						if (value.length < 6) {
							throw getString('NextThought.view.form.PasswordResetForm.short');
						}
						return true;
					}
				}, {
					name: 'password-verify',
					placeholder: getString('NextThought.view.form.PasswordResetForm.verifyplaceholder'),
					allowBlank: true,
					listeners: {
						focus: function(field) {
							field.hasBeenFocused = true;
						}
					},
					validator: function(value) {
						var password = this.previousSibling('[name=password]').getValue();

						if (!this.hasBeenFocused) {
							return false;
						}

						if (value === password) {
							return true;
						}
						throw getString('NextThought.view.form.PasswordResetForm.nomatch');
					}
				}]
		},{
			flex: 1,
			xtype: 'box',
			message: 1,
			cls: 'message-box',
			autoEl: {
				cn: [{cls: 'text'}]
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
			{text: getString('NextThought.view.form.PasswordResetForm.save'), save: 1, ui: 'flat-blue', scale: 'medium', disabled: true }
		]
	}],


	constructor: function() {
		if (!Service.canChangePassword()) {
			console.warn('User can\'t change password');
			this.items = [{
				xtype: 'box',
				cls: 'cant-change',
				renderTpl: Ext.DomHelper.markup({
					cn: [{
						cls: 'title',
						html: getString('reset-password-not-allowed-title')
					},{
						cls: 'subtext',
						html: getString('reset-password-not-allowed-subtext')
					}]
				})
			}];
		}
		this.callParent(arguments);
	},


	setMessage: function(msg, error) {
		var el = this.down('box[message]').getEl().down('.text');
		el[error ? 'addCls' : 'removeCls']('error');
		el.update(msg || '');
	},

	setError: function(errorJson) {
		this.setMessage(errorJson.message, true);
		if (errorJson.field === 'password') {
			this.down('[name=old_password]').setError();
		}
	},


	setSuccess: function() {
		this.setMessage(getString('NextThought.view.form.PasswordResetForm.changed'));
		Ext.each(this.query('simpletext'), function(t) {
			t.suspendEvents();
			t.clearValue(true);
			t.resumeEvents(false);
		});
		this.down('button[save]').disable();
		this.updateLayout();

	},


	getValues: function() {
		return {
			old_password: this.down('[name=old_password]').getValue(),
			password: this.down('[name=password]').getValue()
		};
	},

	afterRender: function() {
		this.callParent(arguments);

		this.inputs = this.query('simpletext');
		Ext.each(this.inputs, function(i) {
			this.mon(i, 'changed', this.checkValidity, this, {buffer: 250});
		},this);
	},


	checkValidity: function(value, input) {

		function val(i, s) {
			try {
				me.setError({message: ''});
				return i.validate(!!s);
			}
			catch (msg) {
					i.setError();
					me.setError({message: msg});
			}
			return false;
		}

		var me = this,
			v = false;

		if (val(input)) {
			me.setMessage();
			v = me.inputs.reduce(function(accum, o) { return accum && val(o, true); }, true);
      //			if(input.name === 'password'){
      //			}
		}

		me.down('button[save]')[v ? 'enable' : 'disable']();
		me.updateLayout();
	}
});
