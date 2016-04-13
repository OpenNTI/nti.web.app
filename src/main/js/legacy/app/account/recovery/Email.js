var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.account.recovery.Email', {
	extend: 'Ext.container.Container',
	alias: 'widget.recovery-email-view',
	cls: 'recovery-email-view',
	layout: 'none',

	items: [
		{xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items: [
			{xtype: 'simpletext', name: 'email', cls: 'input-box', inputType: 'email', placeholder: getString('NextThought.view.account.recovery.Email.email')}
		]},
		{xtype: 'box', hidden: true, name: 'error', autoEl:
			{cls: 'error-box', tag: 'div', cn: [
				{cls: 'error-field'},
				{cls: 'error-desc'}
			]}
		},
		{xtype: 'container', cls: 'submit', name: 'buttons', layout: 'none', items: [
			{xtype: 'button', ui: 'secondary', scale: 'large', name: 'cancel', text: getString('NextThought.view.account.recovery.Email.cancel'), handler: function () {
				this.up('window').close();
			}},
			{
				xtype: 'button',
				ui: 'primary',
				scale: 'large',
				name: 'submit',
				text: getString('NextThought.view.account.recovery.Email.submit'),
				handler: function () {
					var main = this.up('recovery-email-view');

					main.submit();
				}
			}
		]}
	],

	getValue: function () {
		return {
			email: this.down('[name=email]').getValue(),
			fieldName: this.fieldName,
			linkName: this.linkName
		};
	},

	setError: function (error) {
		var box = this.down('[name=error]'),
			field = this.down('[name=email]'),
			bContainer = this.down('[name=buttons]');

		//make main error field show up
		box.el.down('.error-field').update(error.field.replace('_', ' '));
		box.el.down('.error-desc').update(error.message);
		box.show();

		//set error state on specific field
		field.addCls('error');

		if (error.code === 'AttemptingToResendConsentEmailTooSoon') {
			//remove submit:
			Ext.each(bContainer.query('button'), function (b) {b.destroy();});
			bContainer.add({
				xtype: 'button',
				ui: 'primary',
				scale: 'large',
				name: 'cancel',
				text: getString('NextThought.view.account.recovery.Email.cancel'),
				handler: function (b) {
					b.up('window').close();
				}
			});
		}

		this.up('window').updateLayout();
	},

	submit: function () {
		var values = this.getValue(),
			win = this.up('window');

		this.handleSubmit(values)
			.then(win.close.bind(win))
			.catch(this.setError.bind(this));
	}
});
