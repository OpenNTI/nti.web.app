var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.account.contact.Main', {
    extend: 'Ext.container.Container',
    alias: 'widget.contact-main-view',
    cls: 'contact-main-view',

    items: [
		{xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items: [
			{xtype: 'simpletext', name: 'email', cls: 'input-box', inputType: 'email', placeholder: getString('NextThought.view.account.contact.Main.email')},
			{
				xtype: 'box',
				autoEl: {tag: 'textarea', name: 'message', placeholder: getString('NextThought.view.account.contact.Main.input-placeholder')},
				name: 'message',
				cls: 'input-box textarea',
				emptyText: getString('NextThought.view.account.contact.Main.input-placeholder')
			}
		]},
		{
			xtype: 'box',
			hidden: true,
			name: 'error',
			autoEl: {cls: 'error-box', tag: 'div', cn: [
				{cls: 'error-field'},
				{cls: 'error-desc'}
			]}
		},
		{
			xtype: 'container',
			cls: 'submit',
			layout: 'none',
			items: [
				{
					xtype: 'button',
					ui: 'primary',
					scale: 'large',
					name: 'submit',
					style: {'float': 'right'},
					text: getString('NextThought.view.account.contact.Main.submit'),
					handler: function(b) {
						b.up('contact-main-view').submit(b);
					}
				},
				{
					xtype: 'button',
					ui: 'secondary',
					scale: 'large',
					name: 'cancel',
					style: {'float': 'right'},
					text: getString('NextThought.view.account.contact.Main.cancel'),
					handler: function(b) {
						b.up('window').close();
					}
				}
		]}
	],

    afterRender: function() {
		this.callParent(arguments);

		var u = $AppConfig.userObject,
			email = u.get('email'),
			eField = this.down('[name=email]');

		if (email) {
			eField.update(email);
			eField.addCls('valid');
		}
	},

    getValues: function() {
		var email = this.down('[name=email]').getValue(),
			message = this.down('[name=message]').getEl().getValue();

		return {
			//email: email,
			email: email,
			message: message
		};

	},

    setError: function(error) {
		var box = this.down('[name=error]'),
			field = this.down('[name=' + error.field + ']'),
			allFields = this.query('[name]');

		//clear all errors:
		Ext.each(allFields, function(f) {f.removeCls('error');});

		//make main error field show up
		box.el.down('.error-field').update(error.field.replace('_', ' '));
		box.el.down('.error-desc').update(error.message);
		box.show();

		//set error state on specific field
		field.addCls('error');

		this.up('window').updateLayout();
	},

    submit: function(b) {
		var values = this.getValues(),
			win = this.up('window');

		b.addCls('disabled');

		this.handleSubmit(values,win.role)
			.then(win.close.bind(win))
			.fail(this.setError.bind(this));
	}
});
